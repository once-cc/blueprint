import { 
  BlueprintDiscovery, 
  PrimaryPurpose, 
  ConversionGoalValue,
  AdvancedObjectives,
  AdvancedObjectiveKey
} from '@/types/blueprint';
import { 
  CONVERSION_GOALS_BY_PURPOSE, 
  ADVANCED_OBJECTIVES_BY_GOAL,
  ConversionGoalOption,
  AdvancedQuestion,
  FoundationLayer,
  ALL_CONVERSION_GOALS
} from '../data/foundationsData';

// ============= Layer Derivation (Refresh-Safe) =============

export function deriveLayerFromAnswers(discovery: BlueprintDiscovery): FoundationLayer {
  // No site topic → start at topic layer (Layer 0)
  if (!discovery.siteTopic) {
    return 'topic';
  }
  
  // No primary purpose → purpose layer
  if (!discovery.primaryPurpose) {
    return 'purpose';
  }
  
  // Primary selected but secondary not explicitly answered
  // (empty array means "answered but none selected" vs undefined means "not answered")
  if (discovery.secondaryPurposes === undefined) {
    return 'secondary';
  }
  
  // No conversion goals yet
  if (!discovery.conversionGoals || discovery.conversionGoals.length === 0) {
    return 'conversion';
  }
  
  // Check if there are relevant advanced questions and they haven't been answered
  const relevantAdvancedQuestions = getRelevantAdvancedQuestions(discovery.conversionGoals);
  if (relevantAdvancedQuestions.length > 0 && discovery.advancedObjectives === undefined) {
    return 'advanced';
  }
  
  // All layers complete → stay on advanced (will proceed to next step)
  return 'advanced';
}

// ============= Available Goals (Union + Dedupe) =============

export function getAvailableGoals(
  primaryPurpose: PrimaryPurpose | undefined,
  secondaryPurposes: PrimaryPurpose[] | undefined
): ConversionGoalOption[] {
  if (!primaryPurpose) return [];
  
  const purposes = [primaryPurpose, ...(secondaryPurposes || [])];
  const seenValues = new Set<ConversionGoalValue>();
  const goals: ConversionGoalOption[] = [];
  
  // Consistent ordering: iterate purposes in order
  for (const purpose of purposes) {
    const purposeGoals = CONVERSION_GOALS_BY_PURPOSE[purpose] || [];
    for (const goal of purposeGoals) {
      if (!seenValues.has(goal.value)) {
        seenValues.add(goal.value);
        goals.push(goal);
      }
    }
  }
  
  return goals;
}

// ============= Pruning Invalid Answers =============

export function pruneInvalidAnswers(
  discovery: BlueprintDiscovery,
  newPrimaryPurpose?: PrimaryPurpose,
  newSecondaryPurposes?: PrimaryPurpose[]
): Pick<BlueprintDiscovery, 'conversionGoals' | 'advancedObjectives'> {
  const primary = newPrimaryPurpose ?? discovery.primaryPurpose;
  const secondary = newSecondaryPurposes ?? discovery.secondaryPurposes;
  
  // Get valid goals for the new purpose combination
  const validGoals = getAvailableGoals(primary, secondary);
  const validGoalValues = new Set(validGoals.map(g => g.value));
  
  // Prune conversion goals
  const prunedConversionGoals = discovery.conversionGoals?.filter(
    goal => validGoalValues.has(goal)
  );
  
  // Prune advanced objectives (remove keys for goals that no longer exist)
  let prunedAdvancedObjectives: AdvancedObjectives | undefined = undefined;
  if (discovery.advancedObjectives && prunedConversionGoals && prunedConversionGoals.length > 0) {
    const validAdvancedKeys = new Set<AdvancedObjectiveKey>();
    for (const goal of prunedConversionGoals) {
      const questions = ADVANCED_OBJECTIVES_BY_GOAL[goal];
      if (questions) {
        questions.forEach(q => validAdvancedKeys.add(q.key));
      }
    }
    
    prunedAdvancedObjectives = {};
    for (const [key, value] of Object.entries(discovery.advancedObjectives)) {
      if (validAdvancedKeys.has(key as AdvancedObjectiveKey)) {
        prunedAdvancedObjectives[key as AdvancedObjectiveKey] = value;
      }
    }
    
    // If empty object, set to undefined
    if (Object.keys(prunedAdvancedObjectives).length === 0) {
      prunedAdvancedObjectives = undefined;
    }
  }
  
  return {
    conversionGoals: prunedConversionGoals?.length ? prunedConversionGoals : undefined,
    advancedObjectives: prunedAdvancedObjectives,
  };
}

// ============= Advanced Questions =============

export function getRelevantAdvancedQuestions(
  conversionGoals: ConversionGoalValue[] | undefined
): AdvancedQuestion[] {
  if (!conversionGoals || conversionGoals.length === 0) return [];
  
  const questions: AdvancedQuestion[] = [];
  const seenKeys = new Set<string>();
  
  for (const goal of conversionGoals) {
    const goalQuestions = ADVANCED_OBJECTIVES_BY_GOAL[goal];
    if (goalQuestions) {
      for (const question of goalQuestions) {
        if (!seenKeys.has(question.key)) {
          seenKeys.add(question.key);
          questions.push(question);
        }
      }
    }
  }
  
  return questions;
}

// ============= Legacy Migration =============

const LEGACY_PURPOSE_MAP: Record<string, PrimaryPurpose> = {
  leads: 'lead_contact',
  products: 'monetization',
  educate: 'content_community',
  community: 'content_community',
  portfolio: 'promotion',
};

const LEGACY_GOAL_MAP: Record<string, { purpose: PrimaryPurpose; goal: ConversionGoalValue }> = {
  book_call: { purpose: 'lead_contact', goal: 'book_calls' },
  capture_lead: { purpose: 'lead_contact', goal: 'capture_leads' },
  sell_product: { purpose: 'monetization', goal: 'sell_products' },
  educate_trust: { purpose: 'content_community', goal: 'build_authority' },
};

function isLegacyPrimaryPurpose(value: string): boolean {
  return Object.keys(LEGACY_PURPOSE_MAP).includes(value);
}

function isNewPrimaryPurpose(value: string): value is PrimaryPurpose {
  return ['monetization', 'lead_contact', 'promotion', 'operations', 'content_community'].includes(value);
}

export function migrateLegacyDiscovery(discovery: BlueprintDiscovery): BlueprintDiscovery {
  // Already using new format with valid primary purpose
  if (discovery.primaryPurpose && isNewPrimaryPurpose(discovery.primaryPurpose)) {
    return discovery;
  }
  
  const migrated = { ...discovery };
  
  // Map legacy primaryPurpose values (old string literals)
  if (discovery.primaryPurpose && isLegacyPrimaryPurpose(discovery.primaryPurpose)) {
    migrated.primaryPurpose = LEGACY_PURPOSE_MAP[discovery.primaryPurpose];
  }
  
  // Map legacy mainConversionGoal to new structure
  if (discovery.mainConversionGoal && !discovery.primaryPurpose) {
    const mapping = LEGACY_GOAL_MAP[discovery.mainConversionGoal];
    if (mapping) {
      migrated.primaryPurpose = mapping.purpose;
      migrated.conversionGoals = [mapping.goal];
      // Mark secondary as answered (empty = no secondary)
      migrated.secondaryPurposes = [];
    }
  }
  
  return migrated;
}

// ============= Fallback Goals =============

export function getFallbackGoals(): ConversionGoalOption[] {
  return ALL_CONVERSION_GOALS;
}

// ============= Validation Helpers =============

export function canProceedToNextStep(discovery: BlueprintDiscovery): boolean {
  return !!(
    discovery.siteTopic &&
    discovery.primaryPurpose &&
    discovery.secondaryPurposes !== undefined && // Answered (even if empty)
    discovery.conversionGoals &&
    discovery.conversionGoals.length > 0
  );
}

export function isLayerComplete(layer: FoundationLayer, discovery: BlueprintDiscovery): boolean {
  switch (layer) {
    case 'topic':
      return !!discovery.siteTopic;
    case 'purpose':
      return !!discovery.primaryPurpose;
    case 'secondary':
      return discovery.secondaryPurposes !== undefined;
    case 'conversion':
      return !!(discovery.conversionGoals && discovery.conversionGoals.length > 0);
    case 'advanced':
      // Advanced is always "complete" since it's optional
      return true;
    default:
      return false;
  }
}
