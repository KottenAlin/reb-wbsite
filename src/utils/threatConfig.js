// Threat configuration for the cookie clicker game
// Random events that add challenge and variety

export const THREAT_TYPES = {
  INSTANT: "instant",
  DURATION: "duration",
  CHALLENGE: "challenge",
};

export const THREATS = [
  // Instant Threats
  {
    id: "cookie_thief",
    name: "Cookie Thief!",
    description: "A thief stole some of your cookies!",
    type: THREAT_TYPES.INSTANT,
    severity: "medium",
    probability: 0.10, // 10% chance
    checkInterval: 300000, // Check every 5 minutes
    icon: "[!T]",
    effect: (state) => {
      const stolen = Math.floor(state.cookieCount * 0.05);
      return { stolen, message: `Lost ${stolen.toLocaleString()} cookies!` };
    },
  },
  {
    id: "cookie_spoilage",
    name: "Cookie Spoilage!",
    description: "Some cookies have gone bad!",
    type: THREAT_TYPES.INSTANT,
    severity: "high",
    probability: 0.03, // 3% chance
    checkInterval: 1200000, // Check every 20 minutes
    icon: "[!S]",
    effect: (state) => {
      const spoiled = Math.floor(state.totalCookiesEarned * 0.10);
      return { spoiled, message: `${spoiled.toLocaleString()} cookies spoiled!` };
    },
  },
  
  // Duration Threats
  {
    id: "oven_breakdown",
    name: "Oven Breakdown!",
    description: "Your oven is smoking!",
    type: THREAT_TYPES.DURATION,
    severity: "medium",
    probability: 0.05, // 5% chance
    checkInterval: 600000, // Check every 10 minutes
    duration: 30000, // 30 seconds
    icon: "[!O]",
    effect: (state) => {
      return { 
        cpsMultiplier: 0.5, 
        message: "CPS reduced by 50% for 30 seconds!" 
      };
    },
  },
  {
    id: "grandma_strike",
    name: "Grandma Strike!",
    description: "The grandmas demand better working conditions!",
    type: THREAT_TYPES.DURATION,
    severity: "medium",
    probability: 0.05, // 5% chance
    checkInterval: 900000, // Check every 15 minutes
    duration: 60000, // 60 seconds
    icon: "[!G]",
    effect: (state) => {
      return { 
        upgradeDisabled: "grandma", 
        message: "Grandmas stopped working for 60 seconds!" 
      };
    },
  },
  
  // Challenge Threats (Optional mini-games)
  {
    id: "click_frenzy_challenge",
    name: "Click Frenzy!",
    description: "Click 50 times in 10 seconds for bonus!",
    type: THREAT_TYPES.CHALLENGE,
    severity: "low",
    probability: 0.08, // 8% chance
    checkInterval: 600000, // Check every 10 minutes
    duration: 10000, // 10 seconds to complete
    icon: "[C!]",
    requirement: { clicks: 50, time: 10000 },
    reward: (state) => {
      return { 
        cpsBonus: 2.0,
        bonusDuration: 60000,
        message: "2x CPS for 60 seconds!" 
      };
    },
  },
  {
    id: "golden_cookie_rush",
    name: "Golden Cookie Rush!",
    description: "Collect 5 golden cookies in 30 seconds!",
    type: THREAT_TYPES.CHALLENGE,
    severity: "low",
    probability: 0.05, // 5% chance
    checkInterval: 900000, // Check every 15 minutes
    duration: 30000, // 30 seconds to complete
    icon: "[G!]",
    requirement: { goldenCookies: 5, time: 30000 },
    reward: (state) => {
      const bonus = state.totalCookiesEarned * 0.01;
      return { 
        cookieBonus: bonus,
        message: `Earned ${bonus.toLocaleString()} bonus cookies!` 
      };
    },
  },
];

// Defensive Upgrades (protect against threats)
export const DEFENSIVE_UPGRADES = [
  {
    id: "cookie_insurance",
    name: "Cookie Insurance",
    description: "Reduces theft damage from 5% to 2%",
    cost: 500000,
    protectsAgainst: ["cookie_thief"],
    reduction: 0.6, // 60% reduction
    icon: "[I]",
  },
  {
    id: "backup_generator",
    name: "Backup Generator",
    description: "Prevents oven breakdowns",
    cost: 750000,
    protectsAgainst: ["oven_breakdown"],
    prevention: true,
    icon: "[B]",
  },
  {
    id: "union_negotiator",
    name: "Union Negotiator",
    description: "Prevents grandma strikes",
    cost: 1000000,
    protectsAgainst: ["grandma_strike"],
    prevention: true,
    icon: "[U]",
  },
  {
    id: "preservatives",
    name: "Preservatives",
    description: "Prevents cookie spoilage",
    cost: 1500000,
    protectsAgainst: ["cookie_spoilage"],
    prevention: true,
    icon: "[P]",
  },
];

// Active Abilities (player-activated defenses)
export const ACTIVE_ABILITIES = [
  {
    id: "cookie_shield",
    name: "Cookie Shield",
    description: "60-second immunity to all threats",
    duration: 60000,
    cooldown: 600000, // 10 minutes
    icon: "[S]",
  },
  {
    id: "emergency_production",
    name: "Emergency Production",
    description: "10x CPS for 10 seconds",
    duration: 10000,
    cooldown: 300000, // 5 minutes
    multiplier: 10,
    icon: "[E]",
  },
];

// Calculate threat probability with modifiers
export function calculateThreatProbability(threat, defensiveUpgrades) {
  if (defensiveUpgrades[threat.protectedBy]?.prevention) {
    return 0; // Completely prevented
  }
  return threat.probability;
}

// Calculate threat damage with defensive upgrades
export function calculateThreatDamage(threat, damage, defensiveUpgrades) {
  let finalDamage = damage;
  
  // Check if there's a defensive upgrade for this threat
  const defense = DEFENSIVE_UPGRADES.find(def => 
    def.protectsAgainst.includes(threat.id) && 
    defensiveUpgrades[def.id]
  );
  
  if (defense && defense.reduction) {
    finalDamage *= (1 - defense.reduction);
  }
  
  return Math.floor(finalDamage);
}

// Get available threats based on game state
export function getActiveThreats(gameState) {
  return THREATS.filter(threat => {
    // Basic threats always available
    if (threat.id === "cookie_thief" || threat.id === "oven_breakdown") {
      return true;
    }
    
    // Grandma strike only if player has grandmas
    if (threat.id === "grandma_strike") {
      return (gameState.upgrades?.grandma || 0) > 0;
    }
    
    // Spoilage only at higher cookie counts
    if (threat.id === "cookie_spoilage") {
      return gameState.totalCookiesEarned >= 10000000;
    }
    
    // Golden cookie rush only if player has collected golden cookies
    if (threat.id === "golden_cookie_rush") {
      return gameState.goldenCookiesCollected >= 10;
    }
    
    return true;
  });
}
