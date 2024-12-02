import React from 'react';
import {useDispatch} from 'react-redux';
import {useNavigate, Link} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {AppDispatch} from '../../store';
import {login} from '../../actions/authActions';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form';
import {Card, CardContent, CardHeader} from '../ui/card';
import {Alert, AlertDescription} from '../ui/alert';
import {ArrowRight, Mail, Lock, Loader2, Eye, EyeOff} from 'lucide-react';

const loginSchema = z.object({
    loginOrEmail: z.string()
        .min(1, 'Login or Email is required')
        .transform((value) => value.trim())
        .superRefine((val, ctx) => {
            if (val.includes('@')) {
                const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                if (!emailRegex.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Please enter a valid email address',
                    });
                }
            } else if (val.length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Login must be at least 3 characters',
                });
            }
        }),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            loginOrEmail: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        const loginData = values.loginOrEmail.includes('@')
            ? {loginOrEmail: values.loginOrEmail, email: values.loginOrEmail, password: values.password}
            : {loginOrEmail: values.loginOrEmail, login: values.loginOrEmail, password: values.password};

        try {
            await dispatch(login(loginData));
            navigate('/');
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 422 || err.response?.status === 404) {
                setError('Invalid login or password.');
            } else {
                setError('Please verify your email.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">Solve Stack</h1>
                <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
            </div>

            <Card className="w-[400px] shadow-xl bg-background/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-4">
                    <h2 className="text-2xl font-bold text-center text-foreground">Welcome back</h2>
                    <p className="text-sm text-muted-foreground text-center">
                        Enter your credentials to access your account
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="loginOrEmail"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Login or Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    placeholder="Enter your login or email"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    className="pl-10 pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4"/>
                                                    ) : (
                                                        <Eye className="h-4 w-4"/>
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            Sign In
                                            <ArrowRight className="ml-2 h-4 w-4"/>
                                        </div>
                                    )}
                                </Button>

                                <div className="flex flex-col space-y-2 text-center">
                                    <Link
                                        to="/reset-password"
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                    <div className="flex items-center justify-center space-x-1 text-sm">
                                        <span className="text-muted-foreground">Don't have an account?</span>
                                        <Link
                                            to="/register"
                                            className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;