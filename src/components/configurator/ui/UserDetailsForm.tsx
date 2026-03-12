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
            className="relative p-6 rounded-2xl overflow-hidden bg-card/95 dark:bg-zinc-950/90 border border-[hsl(220_12%_12%_/_0.6)] shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.25),inset_0_2px_15px_rgba(0,0,0,0.5)]"
        >
            {/* Top-down light */}
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.04),transparent_40%)]" />

            {/* Corner Ticks */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 pointer-events-none z-0"
            >
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 dark:border-white/20 rounded-tl-[inherit]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 dark:border-white/20 rounded-tr-[inherit]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/10 dark:border-white/20 rounded-bl-[inherit]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 dark:border-white/20 rounded-br-[inherit]" />
            </motion.div>

            <h3 className="relative z-10 text-lg font-nohemi font-medium text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Your Details
            </h3>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground/80">
                        First Name <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
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
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground/80">
                        Last Name <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
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
                    <Label htmlFor="userEmail" className="text-sm font-medium text-foreground/80">
                        Email Address <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
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
                    <Label htmlFor="businessName" className="text-sm font-medium text-foreground/80">
                        Business / Brand Name <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                        <Input
                            id="businessName"
                            value={details.businessName}
                            onChange={(e) => onChange('businessName', e.target.value)}
                            placeholder="E.g. John Doe Donuts Inc."
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
