import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import {Provider} from 'react-redux'
import store from './store'
import Header from './components/Header'
import Home from './components/Home'
import Login from '@/components/auth/Login'
import Register from '@/components/auth/Register'
import ResetPassword from '@/components/auth/ResetPassword'
import ConfirmNewPassword from '@/components/auth/ConfirmNewPassword'
import Profile from './components/user/Profile.tsx'
import UserProfile from './components/user/UserProfile.tsx'
import PrivateRoute from './components/PrivateRoute'
import UsersList from './components/user/UsersList.tsx'
import CategoriesList from './components/categories/CategoriesList'
import CategoryDetails from './components/categories/CategoryDetails'
import ConfirmEmail from "@/components/auth/ConfirmEmail.tsx"
import PostsList from './components/posts/PostsList'
import PostDetails from './components/posts/PostDetails'
import CreatePost from './components/posts/CreatePost'
import EditPost from './components/posts/EditPost'
import ScrollToTop from "@/components/ScrollToTop.tsx";
import Footer from "@/components/Footer.tsx";

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className="min-h-screen bg-background text-foreground">
                    <ScrollToTop/>
                    <Header/>
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/reset-password" element={<ResetPassword/>}/>
                            <Route path="/reset-password/:token" element={<ConfirmNewPassword/>}/>
                            <Route path="/confirm-email/:token" element={<ConfirmEmail/>}/>
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <Profile/>
                                    </PrivateRoute>
                                }
                            />
                            <Route path="/users/:userId" element={<UserProfile/>}/>
                            <Route path="/users" element={<UsersList/>}/>
                            <Route path="/categories" element={<CategoriesList/>}/>
                            <Route path="/categories/:categoryId" element={<CategoryDetails/>}/>
                            {/* Posts Routes */}
                            <Route path="/posts" element={<PostsList/>}/>
                            <Route path="/posts/create" element={
                                <PrivateRoute>
                                    <CreatePost/>
                                </PrivateRoute>
                            }/>
                            <Route path="/posts/:postId" element={<PostDetails/>}/>
                            <Route path="/posts/:postId/edit" element={
                                <PrivateRoute>
                                    <EditPost/>
                                </PrivateRoute>
                            }/>
                        </Routes>
                    </main>
                    <Footer/>
                </div>
            </Router>
        </Provider>
    )
}

export default App
