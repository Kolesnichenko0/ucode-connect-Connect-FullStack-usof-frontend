import React from 'react'
import {useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {AppDispatch} from '../../store'
import {sendPasswordResetLink} from '../../actions/authActions'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form'
import {Card, CardContent, CardHeader} from '../ui/card'
import {Alert, AlertDescription} from '../ui/alert'
import {ArrowRight, Mail, Loader2} from 'lucide-react'

const resetSchema = z.object({
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
})

function ResetPassword() {
    const dispatch = useDispatch<AppDispatch>()
    const [success, setSuccess] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof resetSchema>) => {
        setIsLoading(true)
        try {
            await dispatch(sendPasswordResetLink(values.email))
            setSuccess('Password reset link has been sent to your email.')
            setError(null)
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('No user with this email was found.')
            } else {
                setError('Failed to send reset link. Please try again later.')
            }
            setSuccess(null)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">Solve Stack</h1>
                <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
            </div>

            <Card className="w-[400px] shadow-xl bg-background/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-4">
                    <h2 className="text-2xl font-bold text-center text-foreground">Reset Password</h2>
                    <p className="text-sm text-muted-foreground text-center">
                        Enter your email to receive a password reset link
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
                                <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                                </Alert>
                            )}

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
                                            Send Reset Link
                                            <ArrowRight className="ml-2 h-4 w-4"/>
                                        </div>
                                    )}
                                </Button>

                                <div className="flex justify-center text-sm">
                                    <Link
                                        to="/login"
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ResetPassword