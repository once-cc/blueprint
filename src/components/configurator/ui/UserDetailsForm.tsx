import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Mail, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface UserDetailsData {
    firstName: string;
    lastName: string;
    userEmail: string;
    businessName: string;
}

interface UserDetailsFormProps {
    details: UserDetailsData;
    errors: Record<string, string>;
    onChange: (field: keyof UserDetailsData, value: string) => void;
}

export function UserDetailsForm({ details, errors, onChange }: UserDetailsFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border-2 border-accent/30 bg-accent/5"
        >
            <h3 className="text-lg font-nohemi font-medium text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Your Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="firstName"
                            value={details.firstName}
                            onChange={(e) => onChange('firstName', e.target.value)}
                            placeholder="John"
                            className={cn('pl-10', errors.firstName && 'border-destructive')}
                            maxLength={50}
                        />
                    </div>
                    {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="lastName"
                            value={details.lastName}
                            onChange={(e) => onChange('lastName', e.target.value)}
                            placeholder="Doe"
                            className={cn('pl-10', errors.lastName && 'border-destructive')}
                            maxLength={50}
                        />
                    </div>
                    {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-sm font-medium">
                        Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="userEmail"
                            type="email"
                            value={details.userEmail}
                            onChange={(e) => onChange('userEmail', e.target.value)}
                            placeholder="john@doe.com"
                            className={cn('pl-10', errors.userEmail && 'border-destructive')}
                            maxLength={255}
                        />
                    </div>
                    {errors.userEmail && (
                        <p className="text-xs text-destructive">{errors.userEmail}</p>
                    )}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                        Business / Brand Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="businessName"
                            value={details.businessName}
                            onChange={(e) => onChange('businessName', e.target.value)}
                            placeholder="E.g., John Doe Inc., Doe Nuts"
                            className={cn('pl-10', errors.businessName && 'border-destructive')}
                            maxLength={200}
                        />
                    </div>
                    {errors.businessName && (
                        <p className="text-xs text-destructive">{errors.businessName}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
