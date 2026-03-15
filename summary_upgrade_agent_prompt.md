# Agent Prompt: Upgrade Blueprint Email Summary

> Give this prompt to an agent working in the **Blueprint Configurator** project (`blueprint_config/`).

---

## Your Role

You are a systems engineer and strategic copywriter. Your job is to upgrade the **Blueprint Summary** card in the transactional email (Email 1) that users receive after completing the configurator. The current summary displays raw enum values from the database. You need to transform these into insightful, strategic observations that feel like a human reviewed the submission.

## Context

### The Email System

When a user completes the Blueprint Configurator and submits, two things happen:
1. **Email 1** is sent immediately via Resend (from `supabase/functions/submit-blueprint/index.ts`)
2. The same email template is used by `supabase/functions/resend-email-1/index.ts` for manual re-sends

Both files contain an identical HTML email template with a **Blueprint Summary** card section.

### Current Summary (the problem)

The summary card currently shows raw configurator values:
```
Blueprint Summary

Primary Constraints    book_calls
Primary Objectives     lead_contact · operations
```

This looks like a database dump. `book_calls` and `lead_contact · operations` are raw enum values, not strategic insights. Users should see something that looks like it was written by a strategist who reviewed their submission.

### Where the summary data comes from

In `submit-blueprint/index.ts` (around lines 119–131):

```typescript
const discovery = (blueprint.discovery || {}) as Record<string, unknown>;
const primaryPurpose = escapeHtml((discovery.primaryPurpose as string) || '');
const conversionGoals = (discovery.conversionGoals as string[]) || [];
const secondaryPurposes = (discovery.secondaryPurposes as string[]) || [];

const goalsText = primaryPurpose
    ? [primaryPurpose, ...secondaryPurposes.map(s => escapeHtml(s))].join(' · ')
    : null;
const constraintsText = conversionGoals.length
    ? conversionGoals.map(g => escapeHtml(g)).join(' · ')
    : null;
```

The summary card then displays `constraintsText` as "Primary Constraints" and `goalsText` as "Primary Objectives".

**Problem 1:** The values are raw enum strings (e.g., `book_calls` instead of "Call Booking & Scheduling").
**Problem 2:** The labels "Primary Constraints" and "Primary Objectives" don't accurately describe what these fields contain.
**Problem 3:** There's no strategic interpretation — just data.

---

## Your Task

### 1. Audit the current summary generation

Read both files:
- `supabase/functions/submit-blueprint/index.ts`
- `supabase/functions/resend-email-1/index.ts`

Map exactly how `constraintsText` and `goalsText` are built. Trace it back to the source types.

### 2. Build the insight mapping system

Create a **deterministic mapping** (no AI/LLM at runtime) that transforms raw configurator values into human-readable, strategically-framed text.

#### Data you'll be mapping from

Read `src/types/blueprint.ts` for the full type definitions. Key types:

**PrimaryPurpose** (5 values):
- `monetization` — Monetization & Sales
- `lead_contact` — Lead & Contact Generation
- `promotion` — Promotion & Visibility
- `operations` — Operations & Admin
- `content_community` — Content & Community

**ConversionGoalValue** (15 values):
- Monetization: `sell_products`, `sell_services`, `subscriptions`
- Lead & Contact: `capture_leads`, `book_calls`, `get_inquiries`
- Promotion: `showcase_portfolio`, `build_authority`, `attract_talent`
- Operations: `client_portal`, `internal_tools`, `documentation`
- Content & Community: `publish_content`, `build_audience`, `foster_community`

**SecondaryPurposes** — same as PrimaryPurpose, but the user can select multiple (excluding their primary)

Also available but not currently shown in the summary:
- `siteTopic` — free text industry/niche
- `salesPersonality` — 10 archetypes (see types file)
- `brandVoice` — tone/presence/personality sliders
- `budget`, `timeline`, `pages`, `features`, `riskTolerance`

#### What the mapping should produce

For each value, create:
1. **A human-readable label** (e.g., `book_calls` → "Call Booking & Scheduling")
2. **A strategic framing sentence** (e.g., `book_calls` → "Your site needs to convert visitors into booked calls — this puts specific demands on how trust is built before the CTA.")

For **combinations** of values (e.g., when a user selects `book_calls` + `capture_leads`), create **cluster observations** that note the tension or synergy between competing goals.

### 3. Upgrade the Email 1 Summary Card

Redesign the summary card to show:
- **Better labels** — not "Primary Constraints / Primary Objectives" (these are misleading)
- **Human-readable values** — not raw enums
- **A brief strategic observation** (1-2 sentences) based on the combination of their purpose + goals

The card should feel like a considered summary, not a data table.

**Design constraints (White-Paper Editorial):**
- Background: `#ffffff` card with `#e5e5e5` border
- Labels: `#888888`, 11px uppercase, letter-spacing 0.08em
- Values: `#111111`
- Body text: `#555555`, 15px, line-height 1.7
- Keep it clean and minimal — no more than 3-4 rows

### 4. Update both edge functions

Apply the changes to:
- `supabase/functions/submit-blueprint/index.ts` (lines ~119–177)
- `supabase/functions/resend-email-1/index.ts` (lines ~72–130)

Both must produce identical output.

### 5. Report all variabilities

**This is critical.** After building the mapping, report back a complete matrix of:

1. Every `primaryPurpose` value and its mapped label + insight sentence
2. Every `conversionGoal` value and its mapped label + insight sentence
3. Every notable **combination pattern** (e.g., dual-funnel goals, single-goal focus) and its cluster observation
4. The upgraded summary card HTML for at least 3 example payloads:
   - Example A: `primaryPurpose: 'lead_contact'`, `conversionGoals: ['book_calls', 'capture_leads']`, `secondaryPurposes: ['operations']`
   - Example B: `primaryPurpose: 'monetization'`, `conversionGoals: ['sell_services', 'subscriptions']`, `secondaryPurposes: []`
   - Example C: `primaryPurpose: 'promotion'`, `conversionGoals: ['showcase_portfolio', 'build_authority', 'attract_talent']`, `secondaryPurposes: ['content_community']`

This report will be used by a separate agent to build the nurture email sequence that echoes the summary content.

---

## Success Criteria

- [ ] Raw enum values no longer appear in the email
- [ ] Summary card reads like a strategist wrote it
- [ ] Both `submit-blueprint` and `resend-email-1` produce identical output
- [ ] All variabilities documented in a comprehensive report
- [ ] The mapping system is deterministic (lookup-based, no LLM)
- [ ] Sticks to the White-Paper Editorial design tokens
