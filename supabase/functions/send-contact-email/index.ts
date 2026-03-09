import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const STUDIO_EMAIL = Deno.env.get("STUDIO_EMAIL") || "";
const FROM_EMAIL = "Cleland Studio <onboarding@resend.dev>";

// CORS headers are now dynamic per-request — see _shared/cors.ts

// Zod schema for comprehensive input validation
const ContactFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(100, "Business name must be less than 100 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional().nullable(),
  industry: z.enum([
    'professional-services',
    'creative-agency',
    'consulting',
    'legal-finance',
    'health-wellness',
    'architecture-design',
    'technology',
    'other'
  ], { errorMap: () => ({ message: "Invalid industry selection" }) }),
  goals: z.array(
    z.enum([
      'attract-premium-clients',
      'increase-conversion',
      'build-authority',
      'launch-new',
      'expand-markets',
      'rebrand-entirely'
    ])
  ).min(1, "At least one goal is required").max(10, "Maximum 10 goals allowed"),
  blockers: z.array(
    z.enum([
      'looks-outdated',
      'not-converting',
      'competitors-better',
      'no-time-diy',
      'dont-know-start',
      'past-agencies-disappointed'
    ])
  ).max(10, "Maximum 10 blockers allowed"),
  timeline: z.enum([
    'asap',
    'soon',
    'planning-ahead',
    'exploring'
  ], { errorMap: () => ({ message: "Invalid timeline selection" }) }),
  investment: z.enum([
    'under-5k',
    '5k-10k',
    '10k-20k',
    '25k-50k',
    'flexible'
  ], { errorMap: () => ({ message: "Invalid investment selection" }) }),
  additionalNotes: z.string().max(2000, "Additional notes must be less than 2000 characters").optional().nullable(),
  currentWebsite: z.string().url("Invalid URL format").max(500, "Website URL must be less than 500 characters").optional().nullable().or(z.literal('')),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Safely escape URL for href attributes
function escapeUrl(url: string): string {
  try {
    // Validate it's a proper URL and encode it
    const parsed = new URL(url);
    // Only allow http/https protocols to prevent javascript: URLs
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return escapeHtml(parsed.href);
  } catch {
    return '#';
  }
}

const industryLabels: Record<string, string> = {
  'professional-services': 'Professional Services',
  'creative-agency': 'Creative Agency',
  'consulting': 'Consulting',
  'legal-finance': 'Legal / Finance',
  'health-wellness': 'Health & Wellness',
  'architecture-design': 'Architecture / Design',
  'technology': 'Technology',
  'other': 'Other',
};

const goalLabels: Record<string, string> = {
  'attract-premium-clients': 'Attract premium clients',
  'increase-conversion': 'Increase conversion rates',
  'build-authority': 'Build brand authority',
  'launch-new': 'Launch new service / product',
  'expand-markets': 'Expand to new markets',
  'rebrand-entirely': 'Rebrand entirely',
};

const blockerLabels: Record<string, string> = {
  'looks-outdated': 'Website looks outdated',
  'not-converting': 'Not converting visitors',
  'competitors-better': 'Competitors look better',
  'no-time-diy': 'No time for DIY',
  'dont-know-start': "Don't know where to start",
  'past-agencies-disappointed': 'Past agencies disappointed',
};

const timelineLabels: Record<string, string> = {
  'asap': 'ASAP (within 1 month)',
  'soon': 'Soon (1–2 months)',
  'planning-ahead': 'Planning ahead (3+ months)',
  'exploring': 'Just exploring options',
};

const investmentLabels: Record<string, string> = {
  'under-5k': 'Under $5,000',
  '5k-10k': '$5,000 – $10,000',
  '10k-20k': '$10,000 – $20,000',
  '25k-50k': '$25,000 – $50,000',
  'flexible': 'Flexible for the right solution',
};

function formatList(items: string[], labels: Record<string, string>): string {
  return items.map(item => escapeHtml(labels[item] || item)).join(', ');
}

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("STUDIO_EMAIL value:", STUDIO_EMAIL || "(empty)");
    console.log("FROM_EMAIL:", FROM_EMAIL);
    console.log("isTestMode:", FROM_EMAIL.includes("@resend.dev"));

    const rawData = await req.json();

    // Validate input with Zod schema
    const parseResult = ContactFormSchema.safeParse(rawData);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error("Validation failed:", errorMessages);
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errorMessages}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data: ContactFormData = parseResult.data;
    console.log("Received contact form submission:", { email: data.email, businessName: data.businessName });

    const firstName = escapeHtml(data.name.split(' ')[0]);
    const escapedBusinessName = escapeHtml(data.businessName);
    const escapedName = escapeHtml(data.name);
    const escapedEmail = escapeHtml(data.email);
    const escapedPhone = escapeHtml(data.phone || '');
    const escapedWebsite = data.currentWebsite ? escapeUrl(data.currentWebsite) : '';
    const escapedWebsiteDisplay = escapeHtml(data.currentWebsite || '');
    const escapedNotes = escapeHtml(data.additionalNotes || '');
    const escapedIndustry = escapeHtml(industryLabels[data.industry] || data.industry);
    const escapedTimeline = escapeHtml(timelineLabels[data.timeline] || data.timeline);
    const escapedInvestment = escapeHtml(investmentLabels[data.investment] || data.investment);

    const userEmailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 24px;">Thank you, ${firstName}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          We've received your project enquiry and are excited to learn more about ${escapedBusinessName}.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Our team will review your details and get back to you within 24 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="font-size: 14px; color: #888;">
          Best regards,<br/>
          The Cleland Studio Team
        </p>
      </div>
    `;

    const studioEmailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 24px;">New Project Enquiry</h1>
        
        <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Contact Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedName}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${escapedEmail}">${escapedEmail}</a></td></tr>
          ${escapedPhone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedPhone}</td></tr>` : ''}
        </table>

        <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Business Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Business:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedBusinessName}</td></tr>
          ${escapedWebsite ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Website:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="${escapedWebsite}">${escapedWebsiteDisplay}</a></td></tr>` : ''}
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Industry:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedIndustry}</td></tr>
        </table>

        <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Goals</h2>
        <p style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 8px;">${formatList(data.goals, goalLabels)}</p>

        <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Challenges</h2>
        <p style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 8px;">${formatList(data.blockers, blockerLabels)}</p>

        <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Timeline:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedTimeline}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Investment:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapedInvestment}</td></tr>
        </table>

        ${escapedNotes ? `
          <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px; color: #888;">Additional Notes</h2>
          <p style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 8px;">${escapedNotes}</p>
        ` : ''}
      </div>
    `;

    const isTestMode = FROM_EMAIL.includes("@resend.dev");

    if (isTestMode && STUDIO_EMAIL) {
      const combinedHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <p style="background: #fff3cd; padding: 12px; border-radius: 8px; color: #856404; font-size: 14px;">
            <strong>Test Mode:</strong> This is a test submission. In production, a confirmation will also be sent to ${escapedEmail}.
          </p>
          ${studioEmailHtml}
        </div>
      `;

      await sendEmail(
        [STUDIO_EMAIL],
        `[TEST] New Enquiry: ${escapedBusinessName}`,
        combinedHtml
      );
      console.log("Test mode: notification sent to studio email");
    } else if (!isTestMode) {
      await sendEmail([data.email], "We've received your enquiry!", userEmailHtml);
      console.log("User confirmation email sent");

      if (STUDIO_EMAIL) {
        await sendEmail(
          [STUDIO_EMAIL],
          `New Enquiry: ${escapedBusinessName}`,
          studioEmailHtml
        );
        console.log("Studio notification email sent");
      }
    } else {
      console.log("Test mode without STUDIO_EMAIL configured - skipping email send");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
