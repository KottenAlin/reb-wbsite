// Upgrade configuration for the cookie clicker game
export const UPGRADES = [
  {
    id: "cursor",
    name: "Cursor",
    description: "Auto-clicks once every 10 seconds",
    baseCost: 15,
    cps: 0.1,
    icon: ">_",
    tier: 1,
  },
  {
    id: "grandma",
    name: "Grandma",
    description: "A nice grandma to bake more cookies",
    baseCost: 100,
    cps: 1,
    icon: "&",
    tier: 1,
  },
  {
    id: "farm",
    name: "Farm",
    description: "Grows cookie plants for steady production",
    baseCost: 1100,
    cps: 8,
    icon: "#",
    tier: 2,
  },
  {
    id: "mine",
    name: "Mine",
    description: "Mines cookie dough from deep underground",
    baseCost: 12000,
    cps: 47,
    icon: "%",
    tier: 2,
  },
  {
    id: "factory",
    name: "Factory",
    description: "Mass produces cookies on assembly lines",
    baseCost: 130000,
    cps: 260,
    icon: "=",
    tier: 3,
  },
  {
    id: "bank",
    name: "Bank",
    description: "Generates cookie interest continuously",
    baseCost: 1400000,
    cps: 1400,
    icon: "@",
    tier: 3,
  },
  {
    id: "temple",
    name: "Temple",
    description: "Pray to the cookie gods for blessings",
    baseCost: 20000000,
    cps: 7800,
    icon: "^",
    tier: 4,
  },
  {
    id: "wizard_tower",
    name: "Wizard Tower",
    description: "Summon cookies from other dimensions",
    baseCost: 330000000,
    cps: 44000,
    icon: "!",
    tier: 4,
  },
];

// Cost scaling factor (multiplier per upgrade purchased)
export const COST_MULTIPLIER = 1.15;

// Calculate upgrade cost based on current quantity
export function calculateUpgradeCost(baseCost, quantity) {
  return Math.floor(baseCost * Math.pow(COST_MULTIPLIER, quantity));
}

// Get all upgrades with their current costs
export function getUpgradesWithCosts(ownedUpgrades) {
  return UPGRADES.map((upgrade) => ({
    ...upgrade,
    quantity: ownedUpgrades[upgrade.id] || 0,
    currentCost: calculateUpgradeCost(
      upgrade.baseCost,
      ownedUpgrades[upgrade.id] || 0,
    ),
  }));
}

// Group upgrades by tier
export function getUpgradesByTier(ownedUpgrades) {
  const tiers = {};
  
  UPGRADES.forEach((upgrade) => {
    if (!tiers[upgrade.tier]) {
      tiers[upgrade.tier] = [];
    }
    tiers[upgrade.tier].push({
      ...upgrade,
      quantity: ownedUpgrades[upgrade.id] || 0,
      currentCost: calculateUpgradeCost(
        upgrade.baseCost,
        ownedUpgrades[upgrade.id] || 0,
      ),
    });
  });
  
  return tiers;
}
