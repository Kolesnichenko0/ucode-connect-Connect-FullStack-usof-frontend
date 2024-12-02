import {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState, AppDispatch} from '../../store.ts'
import {getAllUsers, changeUsersPage, changeUsersSort} from '../../actions/userActions.ts'
import {Link} from 'react-router-dom'
import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar.tsx"
import {
    Star,
    Crown,
    User,
    Users,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Mail,
    Calendar,
    BadgeCheck,
} from 'lucide-react'
import {Card, CardContent, CardTitle} from '../ui/card.tsx'
import {Button} from '../ui/button.tsx'
import {Alert, AlertDescription, AlertTitle} from "../ui/alert.tsx"
import {format} from 'date-fns'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../ui/select.tsx'
import {Badge} from '../ui/badge.tsx'
import UserRatingBadge from "@/components/user/UserRatingBadge.tsx";

const USERS_PER_PAGE = 30

function UsersList() {
    const dispatch = useDispatch<AppDispatch>()
    const {
        allUsers,
        allUsersLoading,
        allUsersError,
        allUsersPage,
        allUsersTotal,
        allUsersSort
    } = useSelector((state: RootState) => state.users)

    const sortBy = allUsersSort?.sortBy || 'login'
    const order = allUsersSort?.order || 'ASC'

    useEffect(() => {
        dispatch(getAllUsers(allUsersPage, USERS_PER_PAGE, sortBy as 'login' | 'rating', order as 'ASC' | 'DESC'))
    }, [dispatch, allUsersPage, sortBy, order])

    const totalPages = Math.ceil(allUsersTotal / USERS_PER_PAGE)

    const handleSortChange = (value: string) => {
        if (value === 'login') {
            dispatch(changeUsersSort('login', 'ASC'))
        } else if (value === 'rating') {
            dispatch(changeUsersSort('rating', 'DESC'))
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        dispatch(changeUsersPage(newPage))
    }

    const getRoleIcon = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <Crown className="h-4 w-4"/>
            case 'moderator':
                return <BadgeCheck className="h-4 w-4"/>
            default:
                return <User className="h-4 w-4"/>
        }
    }

    const getRoleColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            case 'moderator':
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
            default:
                return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
        }
    }

    const LoadingCard = () => (
        <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-primary/10 rounded"></div>
                        <div className="h-3 w-1/4 bg-primary/10 rounded"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-primary/10 rounded"></div>
                    <div className="h-3 w-1/2 bg-primary/10 rounded"></div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background">
            <div className="container mx-auto px-4 py-20 max-w-7xl">
                {/* Header Section */}
                <div className="relative mb-12">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl"/>
                    <div className="relative bg-card/50 backdrop-blur-xl rounded-3xl border shadow-2xl">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-primary/10 rounded-2xl">
                                        <Users className="w-12 h-12 text-primary"/>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                            Community Members
                                        </h1>
                                        <p className="text-lg text-muted-foreground mt-2 flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/>
                                            Discovering {allUsersTotal.toLocaleString()} amazing members
                                        </p>
                                    </div>
                                </div>
                                <Select onValueChange={handleSortChange} defaultValue={sortBy}>
                                    <SelectTrigger className="w-[200px] bg-background/50 backdrop-blur">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpDown className="h-4 w-4"/>
                                            <SelectValue placeholder="Sort Members"/>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="login">Username (A-Z)</SelectItem>
                                        <SelectItem value="rating">Rating (High to Low)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {allUsersError && (
                    <Alert variant="destructive" className="mb-8">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{allUsersError}</AlertDescription>
                    </Alert>
                )}

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allUsersLoading ? (
                        Array(6).fill(0).map((_, i) => <LoadingCard key={i}/>)
                    ) : allUsers.length === 0 ? (
                        <div className="col-span-full">
                            <Card className="bg-card/50 backdrop-blur border shadow-xl">
                                <CardContent className="pt-12 pb-12 text-center">
                                    <Users className="w-16 h-16 text-primary/40 mx-auto mb-4"/>
                                    <CardTitle className="text-2xl mb-2">No Users Found</CardTitle>
                                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        allUsers.map(user => (
                            <Link key={user.id} to={`/users/${user.id}`} className="group">
                                <Card
                                    className="bg-card/50 backdrop-blur transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 border hover:border-primary/20">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="relative">
                                                <Avatar
                                                    className="h-16 w-16 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                                                    <AvatarImage src={user.profile_picture_url} alt={user.login}/>
                                                    <AvatarFallback className="bg-primary/5 text-lg">
                                                        {user.login?.charAt(0).toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="absolute -bottom-1 -right-1 translate-x-1 translate-y-1">
                                                    <UserRatingBadge rating={user.rating}/>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">
                                                        {user.login}
                                                    </h3>
                                                    {user.role !== 'user' && (
                                                        <Badge className={`${getRoleColor(user.role)} ml-auto`}>
                                                            <span className="flex items-center gap-1">
                                                                {getRoleIcon(user.role)}
                                                                {user.role}
                                                            </span>
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate mb-3">
                                                    <p className="text-sm text-muted-foreground truncate mb-3">
                                                        {user.full_name ? user.full_name : '\u00A0'}
                                                    </p></p>
                                                <div className="space-y-2">
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4"/>
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4"/>
                                                        <span>Joined {format(new Date(user.created_at), 'MMM yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {allUsersTotal > USERS_PER_PAGE && (
                    <div className="mt-12 flex justify-center">
                        <Card className="bg-card/50 backdrop-blur border p-2 inline-flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePageChange(1)}
                                disabled={allUsersPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePageChange(allUsersPage - 1)}
                                disabled={allUsersPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (allUsersPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (allUsersPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = allUsersPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={pageNumber === allUsersPage ? 'default' : 'ghost'}
                                            className="w-10 h-10"
                                            onClick={() => handlePageChange(pageNumber)}
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePageChange(allUsersPage + 1)}
                                disabled={allUsersPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={allUsersPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4"/>
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UsersList