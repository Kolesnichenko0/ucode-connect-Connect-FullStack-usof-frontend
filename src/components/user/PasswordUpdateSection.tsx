import React, {useState} from 'react';
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Lock, Eye, EyeOff} from 'lucide-react';
import PasswordValidation from './PasswordValidation.tsx';

interface PasswordUpdateSectionProps {
    onSubmit: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const PasswordUpdateSection: React.FC<PasswordUpdateSectionProps> = ({onSubmit}) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isValid, setIsValid] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        await onSubmit({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });
    };

    return (
        <Card className="bg-card/50 backdrop-blur border shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Lock className="w-5 h-5"/>
                    Update Password
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                            <Input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="bg-background/50 pl-10 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4"/>
                                ) : (
                                    <Eye className="h-4 w-4"/>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="bg-background/50 pl-10 pr-10"
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
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="bg-background/50 pl-10 pr-10"
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
                    </div>

                    <PasswordValidation
                        password={formData.newPassword}
                        confirmPassword={formData.confirmPassword}
                        onValidationChange={setIsValid}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid}
                    >
                        Update Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PasswordUpdateSection;