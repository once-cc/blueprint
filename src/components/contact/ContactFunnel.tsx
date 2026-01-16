import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ContactFormData, initialContactFormData, Goal, Blocker } from '@/types/contact';
import { Step1Business } from './steps/Step1Business';
import { Step2Goals } from './steps/Step2Goals';
import { Step3Blockers } from './steps/Step3Blockers';
import { Step4Timeline } from './steps/Step4Timeline';
import { Step5Connect } from './steps/Step5Connect';
import { VideoLogo } from '@/components/ui/VideoLogo';

export function ContactFunnel() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContactFormData>(initialContactFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (value: Goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(value)
        ? prev.goals.filter((g) => g !== value)
        : [...prev.goals, value],
    }));
  };

  const handleBlockerToggle = (value: Blocker) => {
    setFormData((prev) => ({
      ...prev,
      blockers: prev.blockers.includes(value)
        ? prev.blockers.filter((b) => b !== value)
        : [...prev.blockers, value],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Enquiry sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-4">
      {/* Logo above progress - cinematic entrance */}
      <motion.div 
        className="flex justify-center mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <VideoLogo size="xxl" />
      </motion.div>

      {/* Progress bar */}
      <div className="mb-12">
        <motion.p 
          className="text-sm text-muted-foreground mb-4"
          key={step}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          STEP {step} OF 5
        </motion.p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full bg-foreground/10 overflow-hidden"
            >
              <motion.div
                className="h-full bg-foreground rounded-full"
                initial={{ width: 0 }}
                animate={{ width: s <= step ? '100%' : '0%' }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.22, 1, 0.36, 1],
                  delay: s === step ? 0.1 : 0
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1Business
            key="step1"
            industry={formData.industry}
            businessName={formData.businessName}
            currentWebsite={formData.currentWebsite}
            onChange={handleChange}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Goals
            key="step2"
            goals={formData.goals}
            onToggle={handleGoalToggle}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Blockers
            key="step3"
            blockers={formData.blockers}
            onToggle={handleBlockerToggle}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <Step4Timeline
            key="step4"
            timeline={formData.timeline}
            investment={formData.investment}
            onChange={handleChange}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <Step5Connect
            key="step5"
            name={formData.name}
            phone={formData.phone}
            email={formData.email}
            additionalNotes={formData.additionalNotes}
            onChange={handleChange}
            onBack={() => setStep(4)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
