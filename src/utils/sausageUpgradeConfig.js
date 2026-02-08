// Upgrade configuration for the sausage clicker game
export const SAUSAGE_UPGRADES = [
  {
    id: "grill",
    name: "Grill",
    description: "Auto-grills once every 10 seconds",
    baseCost: 15,
    sps: 0.1,
    icon: "~",
  },
  {
    id: "butcher",
    name: "Butcher",
    description: "A skilled butcher to make more sausages",
    baseCost: 100,
    sps: 1,
    icon: "/",
  },
  {
    id: "pig_farm",
    name: "Pig Farm",
    description: "Traditional farming for steady production",
    baseCost: 1100,
    sps: 8,
    icon: "@",
  },
  {
    id: "smokehouse",
    name: "Smokehouse",
    description: "Smokes sausages for that premium flavor",
    baseCost: 12000,
    sps: 47,
    icon: "^",
  },
  {
    id: "sausage_factory",
    name: "Sausage Factory",
    description: "Mass produces sausages on assembly lines",
    baseCost: 130000,
    sps: 260,
    icon: "=",
  },
];

// Cost scaling factor (multiplier per upgrade purchased)
export const COST_MULTIPLIER = 1.15;

// Calculate upgrade cost based on current quantity
export function calculateSausageUpgradeCost(baseCost, quantity) {
  return Math.floor(baseCost * Math.pow(COST_MULTIPLIER, quantity));
}
