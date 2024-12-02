import React from 'react'
import {useDispatch} from 'react-redux'
import {useParams, useNavigate} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {AppDispatch} from '../../store'
import {resetPassword} from '../../actions/authActions'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '../ui/form'
import {Card, CardContent, CardHeader} from '../ui/card'
import {Alert, AlertDescription} from '../ui/alert'
import {ArrowRight, Lock, Loader2, Eye, EyeOff} from 'lucide-react'

const newPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string()
        .min(1, 'Confirm Password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

function ConfirmNewPassword() {
    const {token} = useParams<{ token: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const form = useForm<z.infer<typeof newPasswordSchema>>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
        setIsLoading(true)
        try {
            if (token) {
                await dispatch(resetPassword(token, values.newPassword))
                navigate('/login')
            }
        } catch (err: any) {
            setError('Failed to reset password. Please try again.')
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
                    <h2 className="text-2xl font-bold text-center text-foreground">Set New Password</h2>
                    <p className="text-sm text-muted-foreground text-center">
                        Please enter and confirm your new password
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
                                name="newPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    className="pl-10 pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
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
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
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
                                            Reset Password
                                            <ArrowRight className="ml-2 h-4 w-4"/>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ConfirmNewPassword