// Industry options (single-select)
export type Industry = 
  | 'professional-services' 
  | 'creative-agency' 
  | 'consulting' 
  | 'legal-finance' 
  | 'health-wellness' 
  | 'architecture-design' 
  | 'technology' 
  | 'other';

// Goals (multi-select)
export type Goal = 
  | 'attract-premium-clients' 
  | 'increase-conversion' 
  | 'build-authority' 
  | 'launch-new' 
  | 'expand-markets' 
  | 'rebrand-entirely';

// Blockers (multi-select)
export type Blocker = 
  | 'looks-outdated' 
  | 'not-converting' 
  | 'competitors-better' 
  | 'no-time-diy' 
  | 'dont-know-start' 
  | 'past-agencies-disappointed';

// Timeline (single-select)
export type Timeline = 
  | 'asap' 
  | 'soon' 
  | 'planning-ahead' 
  | 'exploring';

// Investment (single-select)
export type Investment = 
  | 'under-5k' 
  | '5k-10k' 
  | '10k-20k' 
  | '25k-50k' 
  | 'flexible';

export interface ContactFormData {
  // Step 1
  industry: Industry | null;
  businessName: string;
  currentWebsite: string;
  // Step 2
  goals: Goal[];
  // Step 3
  blockers: Blocker[];
  // Step 4
  timeline: Timeline | null;
  investment: Investment | null;
  // Step 5
  name: string;
  phone: string;
  email: string;
  additionalNotes: string;
}

export const initialContactFormData: ContactFormData = {
  industry: null,
  businessName: '',
  currentWebsite: '',
  goals: [],
  blockers: [],
  timeline: null,
  investment: null,
  name: '',
  phone: '',
  email: '',
  additionalNotes: '',
};

export const industryOptions: { value: Industry; label: string }[] = [
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'creative-agency', label: 'Creative Agency' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'legal-finance', label: 'Legal / Finance' },
  { value: 'health-wellness', label: 'Health & Wellness' },
  { value: 'architecture-design', label: 'Architecture / Design' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

export const goalOptions: { value: Goal; label: string }[] = [
  { value: 'attract-premium-clients', label: 'Attract premium clients' },
  { value: 'increase-conversion', label: 'Increase conversion rates' },
  { value: 'build-authority', label: 'Build brand authority' },
  { value: 'launch-new', label: 'Launch new service / product' },
  { value: 'expand-markets', label: 'Expand to new markets' },
  { value: 'rebrand-entirely', label: 'Rebrand entirely' },
];

export const blockerOptions: { value: Blocker; label: string }[] = [
  { value: 'looks-outdated', label: 'Website looks outdated' },
  { value: 'not-converting', label: 'Not converting visitors' },
  { value: 'competitors-better', label: 'Competitors look better' },
  { value: 'no-time-diy', label: 'No time for DIY' },
  { value: 'dont-know-start', label: "Don't know where to start" },
  { value: 'past-agencies-disappointed', label: 'Past agencies disappointed' },
];

export const timelineOptions: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP (within 1 month)' },
  { value: 'soon', label: 'Soon (1–2 months)' },
  { value: 'planning-ahead', label: 'Planning ahead (3+ months)' },
  { value: 'exploring', label: 'Just exploring options' },
];

export const investmentOptions: { value: Investment; label: string }[] = [
  { value: 'under-5k', label: 'Under $5,000' },
  { value: '5k-10k', label: '$5,000 – $10,000' },
  { value: '10k-20k', label: '$10,000 – $25,000' },
  { value: '25k-50k', label: '$25,000 – $50,000' },
  { value: 'flexible', label: 'Flexible for the right outcome' },
];
