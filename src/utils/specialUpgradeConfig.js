// Special upgrade configuration for the cookie clicker game
// These are one-time purchases that provide permanent bonuses

export const UPGRADE_TYPES = {
  MULTIPLIER: "multiplier",
  CLICK_POWER: "click_power",
  GOLDEN_COOKIE: "golden_cookie",
  SPECIAL_EFFECT: "special_effect",
};

export const SPECIAL_UPGRADES = [
  // Multiplier Upgrades (CPS bonuses)
  {
    id: "reinforced_oven",
    name: "Reinforced Oven",
    description: "Increases cookie production by 5%",
    type: UPGRADE_TYPES.MULTIPLIER,
    cost: 50000,
    effect: { type: "cps_multiplier", value: 1.05 },
    unlockCondition: (state) => state.totalCookiesEarned >= 1000,
    icon: "<O>",
    purchased: false,
  },
  {
    id: "industrial_mixer",
    name: "Industrial Mixer",
    description: "Increases cookie production by 10%",
    type: UPGRADE_TYPES.MULTIPLIER,
    cost: 500000,
    effect: { type: "cps_multiplier", value: 1.10 },
    unlockCondition: (state) => state.totalCookiesEarned >= 100000,
    icon: "[M]",
    purchased: false,
  },
  {
    id: "cookie_optimizer",
    name: "Cookie Optimizer",
    description: "Increases cookie production by 25%",
    type: UPGRADE_TYPES.MULTIPLIER,
    cost: 5000000,
    effect: { type: "cps_multiplier", value: 1.25 },
    unlockCondition: (state) => state.totalCookiesEarned >= 1000000,
    icon: "{O}",
    purchased: false,
  },
  {
    id: "divine_blessing",
    name: "Divine Blessing",
    description: "Increases cookie production by 50%",
    type: UPGRADE_TYPES.MULTIPLIER,
    cost: 50000000,
    effect: { type: "cps_multiplier", value: 1.50 },
    unlockCondition: (state) => state.totalCookiesEarned >= 10000000,
    icon: "<*>",
    purchased: false,
  },

  // Click Power Upgrades
  {
    id: "stronger_fingers",
    name: "Stronger Fingers",
    description: "Click power +1",
    type: UPGRADE_TYPES.CLICK_POWER,
    cost: 1000,
    effect: { type: "click_power_bonus", value: 1 },
    unlockCondition: (state) => state.totalClicks >= 100,
    icon: "[F]",
    purchased: false,
  },
  {
    id: "ambidextrous_clicking",
    name: "Ambidextrous Clicking",
    description: "Click power +5",
    type: UPGRADE_TYPES.CLICK_POWER,
    cost: 10000,
    effect: { type: "click_power_bonus", value: 5 },
    unlockCondition: (state) => state.totalClicks >= 1000,
    icon: "[FF]",
    purchased: false,
  },
  {
    id: "bionic_hand",
    name: "Bionic Hand",
    description: "Click power +25",
    type: UPGRADE_TYPES.CLICK_POWER,
    cost: 100000,
    effect: { type: "click_power_bonus", value: 25 },
    unlockCondition: (state) => state.totalClicks >= 10000,
    icon: "{F}",
    purchased: false,
  },
  {
    id: "godlike_touch",
    name: "Godlike Touch",
    description: "Click power +100",
    type: UPGRADE_TYPES.CLICK_POWER,
    cost: 1000000,
    effect: { type: "click_power_bonus", value: 100 },
    unlockCondition: (state) => state.totalClicks >= 100000,
    icon: "<F>",
    purchased: false,
  },

  // Golden Cookie Upgrades
  {
    id: "golden_cookie_duration",
    name: "Golden Cookie Duration",
    description: "Golden cookies last 7 seconds longer (13s → 20s)",
    type: UPGRADE_TYPES.GOLDEN_COOKIE,
    cost: 100000,
    effect: { type: "golden_duration_bonus", value: 7000 },
    unlockCondition: (state) => state.goldenCookiesCollected >= 10,
    icon: "[G+]",
    purchased: false,
  },
  {
    id: "golden_cookie_frequency",
    name: "Golden Cookie Frequency",
    description: "Golden cookies spawn 25% more often",
    type: UPGRADE_TYPES.GOLDEN_COOKIE,
    cost: 250000,
    effect: { type: "golden_frequency_multiplier", value: 0.75 }, // Reduces wait time by 25%
    unlockCondition: (state) => state.goldenCookiesCollected >= 25,
    icon: "[GF]",
    purchased: false,
  },
  {
    id: "golden_cookie_power",
    name: "Golden Cookie Power",
    description: "Increases golden cookie multiplier from 7x to 10x",
    type: UPGRADE_TYPES.GOLDEN_COOKIE,
    cost: 500000,
    effect: { type: "golden_multiplier_bonus", value: 3 }, // +3 to base 7 = 10
    unlockCondition: (state) => state.goldenCookiesCollected >= 50,
    icon: "[GP]",
    purchased: false,
  },
  {
    id: "golden_cookie_luck",
    name: "Golden Cookie Luck",
    description: "50% chance for double golden cookie bonus",
    type: UPGRADE_TYPES.GOLDEN_COOKIE,
    cost: 1000000,
    effect: { type: "golden_double_chance", value: 0.5 },
    unlockCondition: (state) => state.goldenCookiesCollected >= 100,
    icon: "{G}",
    purchased: false,
  },

  // Special Effect Upgrades
  {
    id: "cookie_insurance",
    name: "Cookie Insurance",
    description: "Reduces threat damage by 60%",
    type: UPGRADE_TYPES.SPECIAL_EFFECT,
    cost: 500000,
    effect: { type: "threat_reduction", value: 0.6 },
    unlockCondition: (state) => state.totalCookiesEarned >= 500000,
    icon: "[S]",
    purchased: false,
  },
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "5% chance for double production each second",
    type: UPGRADE_TYPES.SPECIAL_EFFECT,
    cost: 2000000,
    effect: { type: "lucky_production", value: 0.05 },
    unlockCondition: (state) => state.totalCookiesEarned >= 2000000,
    icon: "[L]",
    purchased: false,
  },
];

// Get unlocked special upgrades based on game state
export function getUnlockedSpecialUpgrades(state, purchasedUpgrades) {
  return SPECIAL_UPGRADES.map(upgrade => ({
    ...upgrade,
    unlocked: upgrade.unlockCondition(state),
    purchased: purchasedUpgrades[upgrade.id] || false,
  }));
}

// Get special upgrades by type
export function getSpecialUpgradesByType(type, state, purchasedUpgrades) {
  const upgrades = getUnlockedSpecialUpgrades(state, purchasedUpgrades);
  return upgrades.filter(upgrade => upgrade.type === type);
}

// Calculate total CPS multiplier from purchased upgrades
export function calculateCPSMultiplier(purchasedUpgrades) {
  let multiplier = 1.0;
  
  SPECIAL_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id] && upgrade.effect.type === "cps_multiplier") {
      multiplier *= upgrade.effect.value;
    }
  });
  
  return multiplier;
}

// Calculate total click power bonus from purchased upgrades
export function calculateClickPowerBonus(purchasedUpgrades) {
  let bonus = 0;
  
  SPECIAL_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id] && upgrade.effect.type === "click_power_bonus") {
      bonus += upgrade.effect.value;
    }
  });
  
  return bonus;
}

// Get golden cookie effect modifiers
export function getGoldenCookieModifiers(purchasedUpgrades) {
  const modifiers = {
    durationBonus: 0,
    frequencyMultiplier: 1.0,
    multiplierBonus: 0,
    doubleChance: 0,
  };
  
  SPECIAL_UPGRADES.forEach(upgrade => {
    if (purchasedUpgrades[upgrade.id]) {
      switch (upgrade.effect.type) {
        case "golden_duration_bonus":
          modifiers.durationBonus += upgrade.effect.value;
          break;
        case "golden_frequency_multiplier":
          modifiers.frequencyMultiplier *= upgrade.effect.value;
          break;
        case "golden_multiplier_bonus":
          modifiers.multiplierBonus += upgrade.effect.value;
          break;
        case "golden_double_chance":
          modifiers.doubleChance = upgrade.effect.value;
          break;
      }
    }
  });
  
  return modifiers;
}

// Check if player can afford a special upgrade
export function canAffordSpecialUpgrade(upgrade, cookieCount, purchasedUpgrades) {
  return !purchasedUpgrades[upgrade.id] && cookieCount >= upgrade.cost;
}
