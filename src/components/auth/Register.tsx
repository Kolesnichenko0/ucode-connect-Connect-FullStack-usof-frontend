import React from 'react';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {AppDispatch} from '../../store';
import {register as registerUser} from '../../actions/authActions';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form';
import {Card, CardContent, CardHeader} from '../ui/card';
import {Alert, AlertDescription} from '../ui/alert';
import {ArrowRight, Mail, Lock, User, Loader2, CheckCircle, Eye, EyeOff} from 'lucide-react';

const registerSchema = z.object({
    login: z.string()
        .min(3, 'Login must be at least 3 characters')
        .max(30, 'Login must not exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Only English letters, numbers, and underscores are allowed'),
    email: z.string()
        .min(1, 'Email is required')
        .transform((value) => value.trim())
        .superRefine((val, ctx) => {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid email address',
                });
            }
        }),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const Register = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            login: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        try {
            await dispatch(registerUser(values));
            setSuccess('Registration successful! Please check your email to confirm your account.');
            setError(null);
            form.reset();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setError('A user with this login or email already exists. Please use other data.');
            } else {
                setError('Registration failed. Please try again later.');
            }
            setSuccess(null);
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
                    <h2 className="text-2xl font-bold text-center text-foreground">Create Account</h2>
                    <p className="text-sm text-muted-foreground text-center">
                        Enter your details to create a new account
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
                            {success && (
                                <Alert variant="default" className="mb-4 border-primary/50 bg-primary/10">
                                    <CheckCircle className="h-4 w-4 text-primary mr-2"/>
                                    <AlertDescription className="text-primary">{success}</AlertDescription>
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="login"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Login</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    placeholder="Enter your login"
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
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
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

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm your password"
                                                    className="pl-10 pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
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
                                            Create Account
                                            <ArrowRight className="ml-2 h-4 w-4"/>
                                        </div>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Already have an account? Sign in
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;