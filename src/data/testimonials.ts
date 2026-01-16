export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  fullTestimonial: string;
  projectTitle: string;
  projectDescription: string;
  image?: string;
  results?: string[];
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Founder & CEO",
    company: "Bloom Wellness",
    quote: "The blueprint transformed our entire approach to our digital presence.",
    fullTestimonial: "Working with Cleland was a game-changer for Bloom Wellness. The Website Blueprint they created gave us complete clarity on how to structure our site for maximum conversions. Before, we were just guessing — now every page has a purpose. The blueprint process revealed user journey insights we never would have discovered on our own. Our bookings increased by 340% within three months of launching the new site.",
    projectTitle: "Complete Brand & Web Overhaul",
    projectDescription: "A comprehensive digital transformation including brand strategy, website redesign, and booking system integration.",
    results: ["340% increase in bookings", "65% reduction in bounce rate", "4.2s faster load time"]
  },
  {
    id: "2",
    name: "James Chen",
    role: "Marketing Director",
    company: "Altitude Properties",
    quote: "Finally, a process that eliminates the guesswork from web design.",
    fullTestimonial: "As someone who's worked with multiple agencies, Cleland's blueprint approach stands out. They didn't just ask what we wanted — they mapped out exactly what our customers needed at every stage of their journey. The level of strategic thinking that went into our blueprint was exceptional. It became the foundation that guided every design decision, and the results speak for themselves.",
    projectTitle: "Lead Generation Platform",
    projectDescription: "High-converting real estate platform designed to capture and nurture qualified leads through strategic user journeys.",
    results: ["180% more qualified leads", "52% higher conversion rate", "Reduced cost per acquisition by 40%"]
  },
  {
    id: "3",
    name: "Emma Richardson",
    role: "Creative Director",
    company: "Lumina Studios",
    quote: "The most strategic web project we've ever been part of.",
    fullTestimonial: "What impressed me most about the blueprint process was how deeply they understood our creative vision while grounding it in solid strategy. Every element had a reason. Every interaction was intentional. The result wasn't just a beautiful website — it was a powerful business tool that actually delivers results. Our portfolio inquiries have tripled since launch.",
    projectTitle: "Creative Portfolio & Inquiry System",
    projectDescription: "Immersive portfolio experience with integrated client inquiry and project management systems.",
    results: ["3x portfolio inquiries", "28% higher average project value", "Streamlined client onboarding"]
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Co-Founder",
    company: "Verde Sustainable",
    quote: "They mapped our entire customer journey before writing a single line of code.",
    fullTestimonial: "Sustainability is complex, and we needed a website that could educate while converting. The Cleland team spent weeks understanding our audience before presenting the blueprint. When we saw it, everything clicked. They had mapped customer psychology, objection handling, and trust-building into every scroll. It's not just a website — it's our 24/7 sales team.",
    projectTitle: "Sustainability SaaS Platform",
    projectDescription: "Enterprise sustainability tracking platform with comprehensive reporting and compliance features.",
    results: ["89% demo request rate", "Enterprise clients onboarded 60% faster", "4.9/5 user satisfaction"]
  },
  {
    id: "5",
    name: "Olivia Martins",
    role: "Head of Growth",
    company: "Fintrek",
    quote: "The blueprint paid for itself within the first week of launch.",
    fullTestimonial: "In fintech, trust is everything. The blueprint process identified exactly where we were losing potential customers and mapped out a journey that builds confidence at every touchpoint. The strategic thinking behind the structure was brilliant — from the way information unfolds to how social proof is integrated. Our sign-up rate jumped 127% immediately after launch.",
    projectTitle: "Financial Platform Redesign",
    projectDescription: "Complete redesign of a B2B financial platform focused on trust-building and conversion optimization.",
    results: ["127% increase in sign-ups", "Reduced churn by 34%", "Average session duration up 89%"]
  },
  {
    id: "6",
    name: "Michael O'Brien",
    role: "Founder",
    company: "Atlas Coaching",
    quote: "I've never felt so confident about a website before it was even designed.",
    fullTestimonial: "The blueprint gave me something I'd never had before: certainty. Before a single design was shown, I could see exactly how my website would work, where clients would come from, and how they'd be guided to book. It eliminated all the anxiety of 'will this work?' because the strategy was so solid. Best investment I've made in my business.",
    projectTitle: "Executive Coaching Platform",
    projectDescription: "Premium coaching platform with automated scheduling, content delivery, and client management.",
    results: ["Fully booked within 6 weeks", "45% higher package values", "80% reduction in admin time"]
  }
];
