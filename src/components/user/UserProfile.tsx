import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store.ts'
import {getUserById, getUserPosts, updateUserRole} from '../../actions/userActions.ts'
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar.tsx"
import {Star, Crown, Calendar, User, AlertCircle, Mail, Pencil, FileText} from 'lucide-react'
import {Alert, AlertDescription, AlertTitle} from "../ui/alert.tsx"
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card.tsx'
import {format} from 'date-fns'
import {clearError} from "@/reducers/authReducer.ts"
import {Badge} from "@/components/ui/badge.tsx"
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx";
import PostsList from "@/components/posts/PostsList.tsx";
import {Button} from "@/components/ui/button.tsx";

function UserProfile() {
    const {userId} = useParams<{ userId: string }>()
    const dispatch = useDispatch<AppDispatch>()

    const authUser = useSelector((state: RootState) => state.auth.user)
    const user = useSelector((state: RootState) => state.users.currentUser)
    const loading = useSelector((state: RootState) => state.users.loading)
    const error = useSelector((state: RootState) => state.auth.error)

    const [localUserId, setLocalUserId] = useState<string | undefined>(userId);

    useEffect(() => {
        setLocalUserId(userId);
    }, [userId]);

    useEffect(() => {
        if (userId) {
            dispatch(getUserById(localUserId))
            dispatch(getUserPosts(localUserId))
        }


        return () => {
            dispatch(clearError())
        }
    }, [dispatch, userId])

    const LoadingSkeleton = () => (
        <div className="container mx-auto px-4 py-20 max-w-5xl">
            <div className="relative mb-24">
                <div className="h-80 bg-primary/5 rounded-3xl animate-pulse"/>
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="h-32 w-32 rounded-full bg-primary/10 animate-pulse"/>
                    <div className="mb-4 space-y-2">
                        <div className="h-8 w-48 bg-primary/10 rounded animate-pulse"/>
                        <div className="h-4 w-32 bg-primary/10 rounded animate-pulse"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 p-6 rounded-xl animate-pulse">
                        <div className="h-16 w-full bg-primary/10 rounded"/>
                    </div>
                ))}
            </div>
        </div>
    )

    if (loading) return <LoadingSkeleton/>

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-5xl">
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-5xl">
                <Card className="bg-card/50 backdrop-blur text-center p-12">
                    <User className="w-20 h-20 text-muted-foreground mx-auto mb-6"/>
                    <CardTitle className="text-3xl mb-4">User Not Found</CardTitle>
                    <p className="text-muted-foreground">The requested user profile could not be found.</p>
                </Card>
            </div>
        )
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

    const handleRoleChange = () => {
        if (authUser?.role == 'admin' && user?.role == 'user') {
            dispatch(updateUserRole(userId, 'admin'));
            dispatch(updateUserRole(userId, 'admin')).then(() => {
                dispatch(getUserById(userId));
            });
        }
        dispatch(getUserById(localUserId))
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background">
            <div className="container mx-auto px-4 max-w-5xl pt-20">
                {/* Hero Section with Glassmorphism */}
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
                        <div className="relative">
                            <Avatar className="h-32 w-32 ring-4 ring-background shadow-2xl">
                                <AvatarImage src={user.profile_picture_url} alt={user.login}/>
                                <AvatarFallback className="bg-primary/5 text-4xl">
                                    {user.login?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 translate-x-1 translate-y-1">
                                <UserRatingBadge
                                    rating={user.rating}
                                    className="py-1.5 px-3"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                                {user.full_name || user.login}
                                <Badge variant="outline"
                                       className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                                    {getRoleIcon(user.role)}
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                                {authUser?.role == 'admin' && user?.role == 'user' && (
                                    <Button
                                        onClick={handleRoleChange}
                                        variant="outline"
                                        size="sm"
                                        className="ml-4"
                                    >
                                        <Pencil className="h-4 w-4 mr-2"/>
                                        Promote to Admin
                                    </Button>
                                )}
                            </h1>
                            {user.full_name && (
                                <p className="text-xl text-muted-foreground">@{user.login}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Information Cards */}
                <div className="grid gap-6 mb-8">
                    {/* Main Info Card */}
                    <Card className="bg-card/50 backdrop-blur border shadow-xl">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Mail className="w-5 h-5 text-blue-500"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Calendar className="w-5 h-5 text-emerald-500"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member Since</p>
                                        <p className="font-medium">
                                            {format(new Date(user.created_at), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur border shadow-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <FileText className="w-8 h-8 text-primary"/>
                                    </div>
                                    <div>
                                        <CardTitle
                                            className="text-2xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                            User Posts
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            <Star
                                                className="w-4 h-4 inline-block mr-1 text-yellow-500 fill-yellow-500 -translate-y-0.5"/>
                                            Sharing knowledge and insights
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <PostsList source="user" userId={userId}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UserProfile