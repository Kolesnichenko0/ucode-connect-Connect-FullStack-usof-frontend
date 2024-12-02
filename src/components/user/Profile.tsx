import React, {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store.ts'
import {clearError} from "@/reducers/authReducer.ts"
import {getCurrentUser, uploadAvatar, updateCurrentUser} from '../../actions/userActions.ts'
import {Button} from '../ui/button.tsx'
import {Input} from '../ui/input.tsx'
import {Card, CardContent} from '../ui/card.tsx'
import {Tabs, TabsList, TabsTrigger, TabsContent} from "../ui/tabs.tsx"
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar.tsx"
import {AlertCircle, Camera, User, Mail, Star, Calendar, Crown, Pencil, Lock, Save, X, Upload} from 'lucide-react'
import {Alert, AlertDescription, AlertTitle} from "../ui/alert.tsx"
import {format} from 'date-fns'
import {Badge} from "@/components/ui/badge.tsx"
import PasswordUpdateSection from "@/components/user/PasswordUpdateSection.tsx"
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx"
import PostsList from '../posts/PostsList.tsx'

function Profile() {
    const dispatch = useDispatch<AppDispatch>()
    const authUser = useSelector((state: RootState) => state.auth.user)
    const error = useSelector((state: RootState) => state.auth.error)
    const [editMode, setEditMode] = useState(false)
    const [fullName, setFullName] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile')

    useEffect(() => {
        const fetchUser = async () => {
            if (authUser) {
                const response = await dispatch(getCurrentUser(authUser.id, authUser.role))
            }
        }
        fetchUser()
    }, [dispatch, authUser])

    const handleSaveName = async () => {
        if (authUser) {
            try {
                await dispatch(updateCurrentUser({full_name: fullName}, authUser.id))
                setSuccessMessage('Full name updated successfully.')
                setEditMode(false)
            } catch (err) {
                // Error is handled through auth.error
            }
        }
    }

    const handlePasswordUpdate = async (passwordData: { currentPassword: string; newPassword: string }) => {
        if (authUser) {
            try {
                await dispatch(updateCurrentUser({
                    old_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword
                }, authUser.id))
                setSuccessMessage('Password changed successfully.')
                setEditMode(false)
            } catch (err) {
                // Error is handled through auth.error
            }
        }
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0]
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUploadAvatar = async () => {
        if (avatarFile && authUser) {
            const formData = new FormData()
            formData.append('photo', avatarFile)
            try {
                await dispatch(uploadAvatar(formData, authUser.id))
                setSuccessMessage('Avatar uploaded successfully.')
                setAvatarFile(null)
                setAvatarPreview(null)
                dispatch(getCurrentUser(authUser.id))
                setEditMode(false)
            } catch (err) {
                // Error is handled through auth.error
            }
        }
    }

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            default:
                return 'bg-green-500/10 text-green-500 border-green-500/20'
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <Crown className="h-5 w-5"/>
            default:
                return <User className="h-5 w-5"/>
        }
    }

    if (!authUser) return <div>User not found</div>

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background">
            <div className="container mx-auto px-4 max-w-5xl pt-20">
                {/* Hero Section */}
                <div className="relative mb-24">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl"/>
                    <div
                        className="relative h-80 bg-card/50 backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent"/>
                        <div className="absolute inset-0 bg-grid-white/[0.02]"/>
                    </div>
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 ring-4 ring-background shadow-2xl">
                                <AvatarImage
                                    src={avatarPreview || authUser.profile_picture_url}
                                    alt={authUser.login}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-primary/5 text-4xl">
                                    {authUser.login?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {editMode && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer">
                                        <Camera className="h-8 w-8 text-white"/>
                                        <Input
                                            type="file"
                                            onChange={handleAvatarChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 translate-x-1 translate-y-1">
                                <UserRatingBadge
                                    rating={authUser.rating}
                                    className="py-1.5 px-3"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                                {authUser.full_name || authUser.login}
                                <Badge variant="outline"
                                       className={`${getRoleColor(authUser.role)} flex items-center gap-1`}>
                                    {getRoleIcon(authUser.role)}
                                    {authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)}
                                </Badge>
                                {!editMode && (
                                    <Button
                                        onClick={() => {
                                            setEditMode(true);
                                            setSuccessMessage(null);
                                            dispatch(clearError());
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="ml-4"
                                    >
                                        <Pencil className="h-4 w-4 mr-2"/>
                                        Edit Profile
                                    </Button>
                                )}
                            </h1>
                            {authUser.login && (
                                <p className="text-xl text-muted-foreground">@{authUser.login}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 mb-8">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {editMode && (
                        <div className="flex gap-4 mb-6">
                            <Button
                                variant={activeSection === 'profile' ? 'default' : 'outline'}
                                onClick={() => setActiveSection('profile')}
                            >
                                Profile Details
                            </Button>
                            <Button
                                variant={activeSection === 'password' ? 'default' : 'outline'}
                                onClick={() => setActiveSection('password')}
                            >
                                Change Password
                            </Button>
                        </div>
                    )}

                    {/* Profile Info Card */}
                    {(!editMode || activeSection === 'profile') && (
                        <Card className="bg-card/50 backdrop-blur border shadow-xl">
                            <CardContent className="pt-6">
                                {editMode ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                                <Input
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Full Name"
                                                    className="pl-10"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSaveName}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <Save className="h-4 w-4"/>
                                                Save Name
                                            </Button>
                                        </div>

                                        {avatarPreview && (
                                            <Button
                                                onClick={handleUploadAvatar}
                                                disabled={!avatarFile}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <Upload className="h-4 w-4"/>
                                                Upload New Avatar
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Mail className="w-5 h-5 text-blue-500"/>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{authUser.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Calendar className="w-5 h-5 text-emerald-500"/>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Member Since</p>
                                                <p className="font-medium">
                                                    {format(new Date(authUser.created_at), 'MMMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Password Update Section */}
                    {editMode && activeSection === 'password' && (
                        <PasswordUpdateSection onSubmit={handlePasswordUpdate}/>
                    )}

                    {editMode && (
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={() => {
                                    setEditMode(false);
                                    dispatch(clearError());
                                }}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <X className="h-4 w-4"/>
                                Cancel
                            </Button>
                        </div>
                    )}

                    {/* Tabs Section */}
                    {!editMode && (
                        <Tabs defaultValue="posts" className="mt-8">
                            <TabsList className="w-full justify-start space-x-4 border-b pb-px">
                                <TabsTrigger
                                    value="posts"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                                >
                                    My Posts
                                </TabsTrigger>
                                <TabsTrigger
                                    value="favorites"
                                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
                                >
                                    Favorite Posts
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts">
                                <PostsList source="user" userId={authUser.id}/>
                            </TabsContent>
                            <TabsContent value="favorites">
                                <PostsList source="favorites" userId={authUser.id}/>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile