import {useState, useEffect} from 'react';
import {Check, X} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card.tsx';

const PasswordValidation = ({
                                password,
                                confirmPassword,
                                onValidationChange
                            }: {
    password: string;
    confirmPassword: string;
    onValidationChange: (isValid: boolean) => void;
}) => {
    const [validations, setValidations] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        passwordsMatch: false
    });

    useEffect(() => {
        const newValidations = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            passwordsMatch: password === confirmPassword && password !== ''
        };

        setValidations(newValidations);

        const isValid = Object.values(newValidations).every(Boolean);
        onValidationChange(isValid);
    }, [password, confirmPassword, onValidationChange]);

    const ValidationItem = ({
                                label,
                                isValid
                            }: {
        label: string;
        isValid: boolean;
    }) => (
        <div className="flex items-center gap-2 text-sm">
            {isValid ? (
                <div className="p-1 rounded-full bg-green-500/10">
                    <Check className="w-3 h-3 text-green-500"/>
                </div>
            ) : (
                <div className="p-1 rounded-full bg-destructive/10">
                    <X className="w-3 h-3 text-destructive"/>
                </div>
            )}
            <span className={isValid ? "text-green-500" : "text-destructive"}>
        {label}
        </span>
        </div>
    );

    return (
        <Card className="bg-card/50 backdrop-blur border shadow-sm">
            <CardContent className="pt-6 space-y-3">
                <ValidationItem
                    label="At least 8 characters long"
                    isValid={validations.minLength}
                />
                <ValidationItem
                    label="Contains uppercase letter"
                    isValid={validations.hasUpperCase}
                />
                <ValidationItem
                    label="Contains lowercase letter"
                    isValid={validations.hasLowerCase}
                />
                <ValidationItem
                    label="Contains number"
                    isValid={validations.hasNumber}
                />
                <ValidationItem
                    label="Passwords match"
                    isValid={validations.passwordsMatch}
                />
            </CardContent>
        </Card>
    );
};

export default PasswordValidation;