import { 
  PrimaryPurpose, 
  ConversionGoalValue, 
  AdvancedObjectiveKey 
} from '@/types/blueprint';
import React from 'react';
import { 
  DollarSign, 
  Users, 
  Megaphone, 
  Settings, 
  MessageSquare,
  Camera,
  Palette,
  Heart,
  Building2,
  Hammer,
  ShoppingCart,
  Code2,
  GraduationCap,
  Briefcase,
  UserCircle,
  Target,
  Phone,
  Mail,
  Layout,
  Award,
  UserPlus,
  Lock,
  Wrench,
  BookOpen,
  FileText,
  Bell,
  MessageCircle,
  RefreshCw,
  LucideIcon
} from 'lucide-react';

// ============= Site Topic Options (Layer 0) =============

export interface SiteTopicOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const SITE_TOPIC_OPTIONS: SiteTopicOption[] = [
  { value: 'photography', label: 'Photography', icon: React.createElement(Camera, { className: 'w-4 h-4' }) },
  { value: 'design_creative', label: 'Design / Creative Studio', icon: React.createElement(Palette, { className: 'w-4 h-4' }) },
  { value: 'health_wellness', label: 'Health & Wellness', icon: React.createElement(Heart, { className: 'w-4 h-4' }) },
  { value: 'real_estate', label: 'Real Estate', icon: React.createElement(Building2, { className: 'w-4 h-4' }) },
  { value: 'construction_trades', label: 'Construction / Trades', icon: React.createElement(Hammer, { className: 'w-4 h-4' }) },
  { value: 'ecommerce', label: 'E-commerce', icon: React.createElement(ShoppingCart, { className: 'w-4 h-4' }) },
  { value: 'saas_software', label: 'SaaS / Software', icon: React.createElement(Code2, { className: 'w-4 h-4' }) },
  { value: 'education', label: 'Education', icon: React.createElement(GraduationCap, { className: 'w-4 h-4' }) },
  { value: 'consulting_services', label: 'Consulting / Professional Services', icon: React.createElement(Briefcase, { className: 'w-4 h-4' }) },
  { value: 'personal_brand', label: 'Personal Brand', icon: React.createElement(UserCircle, { className: 'w-4 h-4' }) },
];

// ============= Purpose Options (Layer 1 & 2) =============

export interface PurposeOption {
  value: PrimaryPurpose;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    value: 'monetization',
    label: 'Monetization & Sales',
    description: 'Sell products, services, or subscriptions',
    icon: DollarSign,
  },
  {
    value: 'lead_contact',
    label: 'Lead & Contact',
    description: 'Capture leads, inquiries, or bookings',
    icon: Users,
  },
  {
    value: 'promotion',
    label: 'Promotion & Visibility',
    description: 'Showcase work, build awareness, or attract talent',
    icon: Megaphone,
  },
  {
    value: 'operations',
    label: 'Operations & Admin',
    description: 'Support internal processes or client workflows',
    icon: Settings,
  },
  {
    value: 'content_community',
    label: 'Content & Community',
    description: 'Publish content, build audience, or foster community',
    icon: MessageSquare,
  },
];

// ============= Conversion Goals (Layer 3) =============

export interface ConversionGoalOption {
  value: ConversionGoalValue;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

export const CONVERSION_GOALS_BY_PURPOSE: Record<PrimaryPurpose, ConversionGoalOption[]> = {
  monetization: [
    { value: 'sell_products', label: 'Sell products online', description: 'E-commerce or digital product sales', icon: React.createElement(ShoppingCart, { className: 'w-4 h-4' }) },
    { value: 'sell_services', label: 'Sell services', description: 'Service packages or retainers', icon: React.createElement(Briefcase, { className: 'w-4 h-4' }) },
    { value: 'subscriptions', label: 'Subscription or membership', description: 'Recurring revenue model', icon: React.createElement(RefreshCw, { className: 'w-4 h-4' }) },
  ],
  lead_contact: [
    { value: 'capture_leads', label: 'Capture leads', description: 'Forms, downloads, or email signups', icon: React.createElement(Target, { className: 'w-4 h-4' }) },
    { value: 'book_calls', label: 'Book calls or appointments', description: 'Discovery calls or consultations', icon: React.createElement(Phone, { className: 'w-4 h-4' }) },
    { value: 'get_inquiries', label: 'Get direct inquiries', description: 'Contact form or quote requests', icon: React.createElement(Mail, { className: 'w-4 h-4' }) },
  ],
  promotion: [
    { value: 'showcase_portfolio', label: 'Showcase portfolio', description: 'Display work and case studies', icon: React.createElement(Layout, { className: 'w-4 h-4' }) },
    { value: 'build_authority', label: 'Build authority', description: 'Thought leadership and expertise', icon: React.createElement(Award, { className: 'w-4 h-4' }) },
    { value: 'attract_talent', label: 'Attract talent', description: 'Hiring and recruitment', icon: React.createElement(UserPlus, { className: 'w-4 h-4' }) },
  ],
  operations: [
    { value: 'client_portal', label: 'Client portal', description: 'Client access and collaboration', icon: React.createElement(Lock, { className: 'w-4 h-4' }) },
    { value: 'internal_tools', label: 'Internal tools', description: 'Team dashboards or workflows', icon: React.createElement(Wrench, { className: 'w-4 h-4' }) },
    { value: 'documentation', label: 'Documentation hub', description: 'Knowledge base or help center', icon: React.createElement(BookOpen, { className: 'w-4 h-4' }) },
  ],
  content_community: [
    { value: 'publish_content', label: 'Publish content', description: 'Blog, articles, or media', icon: React.createElement(FileText, { className: 'w-4 h-4' }) },
    { value: 'build_audience', label: 'Build audience', description: 'Newsletter or follower growth', icon: React.createElement(Bell, { className: 'w-4 h-4' }) },
    { value: 'foster_community', label: 'Foster community', description: 'Forums, groups, or interaction', icon: React.createElement(MessageCircle, { className: 'w-4 h-4' }) },
  ],
};

// Full catalog for fallback scenarios
export const ALL_CONVERSION_GOALS: ConversionGoalOption[] = Object.values(
  CONVERSION_GOALS_BY_PURPOSE
).flat();

// ============= Advanced Objectives (Layer 4) =============

export interface AdvancedQuestionOption {
  value: string;
  label: string;
}

export interface AdvancedQuestion {
  key: AdvancedObjectiveKey;
  question: string;
  options: AdvancedQuestionOption[];
}

export const ADVANCED_OBJECTIVES_BY_GOAL: Partial<Record<ConversionGoalValue, AdvancedQuestion[]>> = {
  sell_services: [
    { 
      key: 'pricing_model', 
      question: 'How do you price your services?', 
      options: [
        { value: 'hourly', label: 'Hourly rate' },
        { value: 'project', label: 'Project-based' },
        { value: 'retainer', label: 'Monthly retainer' },
        { value: 'value_based', label: 'Value-based' },
      ]
    },
    { 
      key: 'visibility', 
      question: 'Should pricing be visible on the site?', 
      options: [
        { value: 'yes', label: 'Yes, display publicly' },
        { value: 'no', label: 'No, discuss on calls' },
        { value: 'custom_quotes', label: 'Show "Get a Quote"' },
      ]
    },
  ],
  book_calls: [
    { 
      key: 'booking_type', 
      question: 'What type of booking?', 
      options: [
        { value: 'discovery_call', label: 'Discovery call' },
        { value: 'consultation', label: 'Paid consultation' },
        { value: 'demo', label: 'Product demo' },
        { value: 'interview', label: 'Interview / screening' },
      ]
    },
  ],
  capture_leads: [
    { 
      key: 'lead_type', 
      question: 'What type of leads?', 
      options: [
        { value: 'email_signup', label: 'Email signup' },
        { value: 'contact_form', label: 'Contact form' },
        { value: 'gated_content', label: 'Gated content download' },
        { value: 'quiz_funnel', label: 'Quiz or assessment' },
      ]
    },
  ],
  publish_content: [
    { 
      key: 'content_format', 
      question: 'Primary content format?', 
      options: [
        { value: 'articles', label: 'Written articles' },
        { value: 'video', label: 'Video content' },
        { value: 'podcast', label: 'Podcast / audio' },
        { value: 'mixed', label: 'Mixed formats' },
      ]
    },
  ],
};

// ============= Layer Definitions =============

export type FoundationLayer = 'topic' | 'purpose' | 'secondary' | 'conversion' | 'advanced';

export const LAYER_ORDER: FoundationLayer[] = ['topic', 'purpose', 'secondary', 'conversion', 'advanced'];

export const LAYER_LABELS: Record<FoundationLayer, string> = {
  topic: 'Context',
  purpose: 'Purpose',
  secondary: 'Secondary',
  conversion: 'Goals',
  advanced: 'Details',
};
