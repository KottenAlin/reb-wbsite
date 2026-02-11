// Tech tree configuration for the cookie clicker game
// Research system that provides permanent bonuses

export const TECH_CATEGORIES = {
  PRODUCTION: "production",
  TECHNOLOGY: "technology",
  GOLDEN: "golden",
  PRESTIGE: "prestige",
};

export const TECH_TREE = [
  // Production Research (Tier 1)
  {
    id: "efficient_baking",
    name: "Efficient Baking",
    description: "Cursors are 10% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 1,
    cost: 5,
    prerequisites: [],
    effect: { type: "upgrade_multiplier", upgradeId: "cursor", value: 1.1 },
    icon: "[E1]",
  },
  {
    id: "farm_optimization",
    name: "Farm Optimization",
    description: "Farms are 10% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 1,
    cost: 5,
    prerequisites: [],
    effect: { type: "upgrade_multiplier", upgradeId: "farm", value: 1.1 },
    icon: "[F1]",
  },
  
  // Production Research (Tier 2)
  {
    id: "master_baking",
    name: "Master Baking",
    description: "Cursors are 25% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 2,
    cost: 15,
    prerequisites: ["efficient_baking"],
    effect: { type: "upgrade_multiplier", upgradeId: "cursor", value: 1.25 },
    icon: "[E2]",
  },
  {
    id: "industrial_farming",
    name: "Industrial Farming",
    description: "Farms are 25% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 2,
    cost: 15,
    prerequisites: ["farm_optimization"],
    effect: { type: "upgrade_multiplier", upgradeId: "farm", value: 1.25 },
    icon: "[F2]",
  },
  {
    id: "grandma_training",
    name: "Grandma Training",
    description: "Grandmas are 20% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 2,
    cost: 10,
    prerequisites: [],
    effect: { type: "upgrade_multiplier", upgradeId: "grandma", value: 1.2 },
    icon: "[G1]",
  },
  
  // Production Research (Tier 3)
  {
    id: "advanced_mining",
    name: "Advanced Mining",
    description: "Mines are 30% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 3,
    cost: 40,
    prerequisites: ["industrial_farming"],
    effect: { type: "upgrade_multiplier", upgradeId: "mine", value: 1.3 },
    icon: "[M1]",
  },
  {
    id: "factory_automation",
    name: "Factory Automation",
    description: "Factories are 40% more efficient",
    category: TECH_CATEGORIES.PRODUCTION,
    tier: 3,
    cost: 40,
    prerequisites: ["industrial_farming"],
    effect: { type: "upgrade_multiplier", upgradeId: "factory", value: 1.4 },
    icon: "[FA]",
  },
  
  // Technology Research (Tier 1)
  {
    id: "automation_basics",
    name: "Automation Basics",
    description: "Unlock automation features",
    category: TECH_CATEGORIES.TECHNOLOGY,
    tier: 1,
    cost: 5,
    prerequisites: [],
    effect: { type: "feature_unlock", feature: "automation" },
    icon: "[A1]",
  },
  {
    id: "click_enhancer",
    name: "Click Enhancer",
    description: "Upgrade-based click power increased by 50%",
    category: TECH_CATEGORIES.TECHNOLOGY,
    tier: 1,
    cost: 10,
    prerequisites: [],
    effect: { type: "click_multiplier", value: 1.5 },
    icon: "[C+]",
  },
  
  // Technology Research (Tier 2)
  {
    id: "auto_upgrade_1",
    name: "Auto-Upgrade I",
    description: "Option to auto-buy cheapest affordable upgrade",
    category: TECH_CATEGORIES.TECHNOLOGY,
    tier: 2,
    cost: 20,
    prerequisites: ["automation_basics"],
    effect: { type: "feature_unlock", feature: "auto_upgrade" },
    icon: "[AU]",
  },
  {
    id: "advanced_clicking",
    name: "Advanced Clicking",
    description: "Upgrade-based click power increased by 100%",
    category: TECH_CATEGORIES.TECHNOLOGY,
    tier: 2,
    cost: 25,
    prerequisites: ["click_enhancer"],
    effect: { type: "click_multiplier", value: 2.0 },
    icon: "[C++]",
  },
  
  // Golden Cookie Research (Tier 1)
  {
    id: "golden_studies",
    name: "Golden Studies",
    description: "Begin studying golden cookies",
    category: TECH_CATEGORIES.GOLDEN,
    tier: 1,
    cost: 5,
    prerequisites: [],
    effect: { type: "feature_unlock", feature: "golden_studies" },
    icon: "[GS]",
  },
  
  // Golden Cookie Research (Tier 2)
  {
    id: "golden_detection",
    name: "Golden Detection",
    description: "Visual warning 3 seconds before golden cookie spawns",
    category: TECH_CATEGORIES.GOLDEN,
    tier: 2,
    cost: 15,
    prerequisites: ["golden_studies"],
    effect: { type: "feature_unlock", feature: "golden_warning" },
    icon: "[GD]",
  },
  {
    id: "golden_extension",
    name: "Golden Extension",
    description: "+5 seconds to golden cookie duration",
    category: TECH_CATEGORIES.GOLDEN,
    tier: 2,
    cost: 15,
    prerequisites: ["golden_studies"],
    effect: { type: "golden_duration_bonus", value: 5000 },
    icon: "[GE]",
  },
  
  // Golden Cookie Research (Tier 3)
  {
    id: "golden_mastery",
    name: "Golden Mastery",
    description: "Golden cookie multiplier +2 (7x → 9x)",
    category: TECH_CATEGORIES.GOLDEN,
    tier: 3,
    cost: 40,
    prerequisites: ["golden_detection", "golden_extension"],
    effect: { type: "golden_multiplier_bonus", value: 2 },
    icon: "[GM]",
  },
  
  // Prestige Research (Tier 1) - Unlocked after first prestige
  {
    id: "prestige_efficiency",
    name: "Prestige Efficiency",
    description: "Earn 10% more prestige points",
    category: TECH_CATEGORIES.PRESTIGE,
    tier: 1,
    cost: 10,
    prerequisites: [],
    unlockCondition: (state) => state.prestigeLevel >= 1,
    effect: { type: "prestige_multiplier", value: 1.1 },
    icon: "[PE]",
  },
  {
    id: "fast_start",
    name: "Fast Start",
    description: "Begin each prestige with 5000 cookies",
    category: TECH_CATEGORIES.PRESTIGE,
    tier: 1,
    cost: 15,
    prerequisites: [],
    unlockCondition: (state) => state.prestigeLevel >= 1,
    effect: { type: "starting_cookies_bonus", value: 5000 },
    icon: "[FS]",
  },
  
  // Prestige Research (Tier 2)
  {
    id: "prestige_mastery",
    name: "Prestige Mastery",
    description: "Earn 25% more prestige points",
    category: TECH_CATEGORIES.PRESTIGE,
    tier: 2,
    cost: 30,
    prerequisites: ["prestige_efficiency"],
    unlockCondition: (state) => state.prestigeLevel >= 5,
    effect: { type: "prestige_multiplier", value: 1.25 },
    icon: "[PM]",
  },
  {
    id: "prestige_boost",
    name: "Prestige Boost",
    description: "Prestige multiplier increased by 50%",
    category: TECH_CATEGORIES.PRESTIGE,
    tier: 2,
    cost: 35,
    prerequisites: ["prestige_efficiency"],
    unlockCondition: (state) => state.prestigeLevel >= 3,
    effect: { type: "prestige_bonus_multiplier", value: 1.5 },
    icon: "[PB]",
  },
];

// Calculate tech points from total cookies earned
export function calculateTechPoints(totalCookiesEarned) {
  return Math.floor(totalCookiesEarned / 1000000); // 1 point per million cookies
}

// Get available tech tree nodes based on researched techs and game state
export function getAvailableTechs(researchedTechs, gameState) {
  return TECH_TREE.map(tech => {
    // Check unlock condition (for prestige techs)
    let unlocked = true;
    if (tech.unlockCondition) {
      unlocked = tech.unlockCondition(gameState);
    }
    
    // Check if already researched
    const researched = researchedTechs.has(tech.id);
    
    // Check if prerequisites are met
    let prerequisitesMet = true;
    if (tech.prerequisites.length > 0) {
      prerequisitesMet = tech.prerequisites.every(prereq => researchedTechs.has(prereq));
    }
    
    // Can research if unlocked, not researched, and prerequisites met
    const canResearch = unlocked && !researched && prerequisitesMet;
    
    return {
      ...tech,
      unlocked,
      researched,
      prerequisitesMet,
      canResearch,
    };
  });
}

// Get techs by category
export function getTechsByCategory(category, researchedTechs, gameState) {
  const allTechs = getAvailableTechs(researchedTechs, gameState);
  return allTechs.filter(tech => tech.category === category);
}

// Get techs by tier
export function getTechsByTier(tier, researchedTechs, gameState) {
  const allTechs = getAvailableTechs(researchedTechs, gameState);
  return allTechs.filter(tech => tech.tier === tier);
}

// Calculate total upgrade multiplier for a specific upgrade type
export function calculateTechUpgradeMultiplier(upgradeId, researchedTechs) {
  let multiplier = 1.0;
  
  TECH_TREE.forEach(tech => {
    if (researchedTechs.has(tech.id) && 
        tech.effect.type === "upgrade_multiplier" && 
        tech.effect.upgradeId === upgradeId) {
      multiplier *= tech.effect.value;
    }
  });
  
  return multiplier;
}

// Calculate total click multiplier from tech tree
export function calculateTechClickMultiplier(researchedTechs) {
  let multiplier = 1.0;
  
  TECH_TREE.forEach(tech => {
    if (researchedTechs.has(tech.id) && tech.effect.type === "click_multiplier") {
      multiplier *= tech.effect.value;
    }
  });
  
  return multiplier;
}

// Get unlocked features from tech tree
export function getUnlockedFeatures(researchedTechs) {
  const features = new Set();
  
  TECH_TREE.forEach(tech => {
    if (researchedTechs.has(tech.id) && tech.effect.type === "feature_unlock") {
      features.add(tech.effect.feature);
    }
  });
  
  return features;
}
