// Prestige upgrade configuration
// These upgrades can only be purchased with prestige points

export const PRESTIGE_UPGRADES = [
  // Prestige Bonus Upgrades (CPS multipliers)
  {
    id: "prestige_bonus_1",
    name: "Prestige Bonus I",
    description: "Permanent +5% cookie production",
    cost: 10,
    effect: { type: "cps_multiplier", value: 1.05 },
    icon: "[P1]",
  },
  {
    id: "prestige_bonus_2",
    name: "Prestige Bonus II",
    description: "Permanent +10% cookie production",
    cost: 25,
    effect: { type: "cps_multiplier", value: 1.10 },
    prerequisites: ["prestige_bonus_1"],
    icon: "[P2]",
  },
  {
    id: "prestige_bonus_3",
    name: "Prestige Bonus III",
    description: "Permanent +15% cookie production",
    cost: 50,
    effect: { type: "cps_multiplier", value: 1.15 },
    prerequisites: ["prestige_bonus_2"],
    icon: "[P3]",
  },
  
  // Utility Upgrades
  {
    id: "lucky_prestige",
    name: "Lucky Prestige",
    description: "+1% chance for double cookies each second",
    cost: 20,
    effect: { type: "lucky_production", value: 0.01 },
    icon: "[L]",
  },
  {
    id: "prestige_golden_cookies",
    name: "Prestige Golden Cookies",
    description: "Golden cookies spawn 50% more often",
    cost: 30,
    effect: { type: "golden_frequency", value: 0.5 },
    icon: "[G]",
  },
  {
    id: "starting_boost",
    name: "Starting Boost",
    description: "Start each prestige with 1,000 cookies",
    cost: 40,
    effect: { type: "starting_cookies", value: 1000 },
    icon: "[S]",
  },
  {
    id: "prestige_efficiency",
    name: "Prestige Efficiency",
    description: "Earn 10% more prestige points",
    cost: 35,
    effect: { type: "prestige_multiplier", value: 1.10 },
    icon: "[E]",
  },
  
  // Click Power Upgrades
  {
    id: "prestige_clicking_1",
    name: "Prestige Clicking I",
    description: "Clicks are 50% more powerful",
    cost: 15,
    effect: { type: "click_multiplier", value: 1.5 },
    icon: "[C1]",
  },
  {
    id: "prestige_clicking_2",
    name: "Prestige Clicking II",
    description: "Clicks are 100% more powerful",
    cost: 45,
    effect: { type: "click_multiplier", value: 2.0 },
    prerequisites: ["prestige_clicking_1"],
    icon: "[C2]",
  },
  
  // Upgrade Efficiency
  {
    id: "cheaper_upgrades_1",
    name: "Cheaper Upgrades I",
    description: "All upgrades cost 5% less",
    cost: 25,
    effect: { type: "upgrade_cost_reduction", value: 0.05 },
    icon: "[-1]",
  },
  {
    id: "cheaper_upgrades_2",
    name: "Cheaper Upgrades II",
    description: "All upgrades cost 10% less",
    cost: 60,
    effect: { type: "upgrade_cost_reduction", value: 0.10 },
    prerequisites: ["cheaper_upgrades_1"],
    icon: "[-2]",
  },
];

// Get unlocked prestige upgrades based on purchased upgrades
export function getUnlockedPrestigeUpgrades(purchasedUpgrades) {
  return PRESTIGE_UPGRADES.map(upgrade => {
    // Check prerequisites
    let unlocked = true;
    if (upgrade.prerequisites) {
      unlocked = upgrade.prerequisites.every(prereq => purchasedUpgrades[prereq]);
    }
    
    return {
      ...upgrade,
      unlocked,
      purchased: purchasedUpgrades[upgrade.id] || false,
    };
  });
}

// Get prestige upgrades by category
export function getPrestigeUpgradesByCategory(purchasedUpgrades) {
  const categories = {
    production: [],
    utility: [],
    clicking: [],
    efficiency: [],
  };
  
  const upgrades = getUnlockedPrestigeUpgrades(purchasedUpgrades);
  
  upgrades.forEach(upgrade => {
    if (upgrade.id.startsWith("prestige_bonus")) {
      categories.production.push(upgrade);
    } else if (upgrade.id.startsWith("prestige_clicking")) {
      categories.clicking.push(upgrade);
    } else if (upgrade.id.startsWith("cheaper_upgrades")) {
      categories.efficiency.push(upgrade);
    } else {
      categories.utility.push(upgrade);
    }
  });
  
  return categories;
}

// Calculate total click multiplier from prestige upgrades
export function calculatePrestigeClickMultiplier(purchasedUpgrades) {
  let multiplier = 1.0;
  
  PRESTIGE_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id] && upgrade.effect.type === "click_multiplier") {
      multiplier *= upgrade.effect.value;
    }
  });
  
  return multiplier;
}

// Calculate upgrade cost reduction from prestige upgrades
export function calculateUpgradeCostReduction(purchasedUpgrades) {
  let reduction = 0;
  
  PRESTIGE_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id] && upgrade.effect.type === "upgrade_cost_reduction") {
      reduction += upgrade.effect.value;
    }
  });
  
  return Math.min(reduction, 0.5); // Cap at 50% reduction
}

// Get starting cookies from prestige upgrades
export function getStartingCookies(purchasedUpgrades) {
  let cookies = 0;
  
  PRESTIGE_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id] && upgrade.effect.type === "starting_cookies") {
      cookies += upgrade.effect.value;
    }
  });
  
  return cookies;
}

// Check if player can afford a prestige upgrade
export function canAffordPrestigeUpgrade(upgrade, availablePoints, purchasedUpgrades) {
  if (purchasedUpgrades[upgrade.id]) return false;
  if (availablePoints < upgrade.cost) return false;
  
  // Check prerequisites
  if (upgrade.prerequisites) {
    return upgrade.prerequisites.every(prereq => purchasedUpgrades[prereq]);
  }
  
  return true;
}
