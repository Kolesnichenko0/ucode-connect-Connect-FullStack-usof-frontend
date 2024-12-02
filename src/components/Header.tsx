import {useSelector, useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'
import {RootState, AppDispatch} from '../store'
import {logout} from '../actions/authActions'
import {Button} from './ui/button'
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "./ui/dropdown-menu"
import {Home, FileText, Grid, Users, LogOut, User, Shield, Menu, X, Crown} from 'lucide-react'
import {useState, useEffect} from 'react'
import PostSearchDropdown from './posts/PostSearchDropdown.tsx'
import {Badge} from "@/components/ui/badge.tsx";

function Header() {
    const user = useSelector((state: RootState) => state.auth.user)
    const dispatch = useDispatch<AppDispatch>()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 1)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isMobileMenuOpen])

    const handleLogout = () => {
        dispatch(logout())
        setIsMobileMenuOpen(false)
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

    const navigationItems = [
        {path: '/', label: 'Main Page', icon: Home},
        {path: '/posts', label: 'Posts', icon: FileText},
        {path: '/categories', label: 'Categories', icon: Grid},
        {path: '/users', label: 'Users', icon: Users},
    ]

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-background'
        }`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="relative h-10 w-10 lg:h-12 lg:w-12">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Solve Stack
                        </h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <item.icon className="h-4 w-4 mr-2"/>
                                {item.label}
                            </Link>
                        ))}

                        <div className="w-64">
                            <PostSearchDropdown/>
                        </div>

                        {user ? (
                            <div className="flex items-center ml-4 space-x-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar
                                                className="h-10 w-10 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                                                <AvatarImage
                                                    src={user.profile_picture_url}
                                                    alt={user.login}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback
                                                    className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                                    {user.login.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <div className="flex flex-col p-2 gap-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.profile_picture_url} alt={user.login}/>
                                                    <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.login}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline"
                                                   className={`${getRoleColor(user.role)} self-start flex items-center gap-1`}>
                                                {getRoleIcon(user.role)}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </div>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem asChild className="gap-2">
                                            <Link to="/profile">
                                                <User className="h-4 w-4"/>
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        {user.role === 'admin' && (
                                            <DropdownMenuItem asChild className="gap-2">
                                                <Link to="http://localhost:3001/admin" target="_blank"
                                                      rel="noopener noreferrer">
                                                    <Shield className="h-4 w-4"/>
                                                    Admin Panel
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem onClick={handleLogout}
                                                          className="gap-2 text-red-500 focus:text-red-500">
                                            <LogOut className="h-4 w-4"/>
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Button asChild variant="default" className="ml-4">
                                <Link to="/login">Login</Link>
                            </Button>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6"/>
                        ) : (
                            <Menu className="h-6 w-6"/>
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-background border-t border-border overflow-y-auto">
                    <div className="py-4 space-y-2">
                        <div className="px-4">
                            <PostSearchDropdown/>
                        </div>
                        {navigationItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md"
                            >
                                <item.icon className="h-4 w-4 mr-2"/>
                                {item.label}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                <div className="px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.profile_picture_url} alt={user.login}/>
                                            <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.login}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                        <Badge variant="outline"
                                               className={`${getRoleColor(user.role)} self-start flex items-center gap-1`}>
                                            {getRoleIcon(user.role)}
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md"
                                >
                                    <User className="h-4 w-4 mr-2"/>
                                    Profile
                                </Link>
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md"
                                    >
                                        <Shield className="h-4 w-4 mr-2"/>
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-accent rounded-md w-full"
                                >
                                    <LogOut className="h-4 w-4 mr-2"/>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="px-4">
                                <Button asChild variant="default" className="w-full">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header

