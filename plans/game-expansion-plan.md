# Cookie Clicker Game Expansion - Implementation Plan

## Overview
This document outlines the implementation plan for expanding the Cookie Clicker game with:
1. **More Achievements** (20+ new achievements across multiple categories)
2. **Special Upgrades** (multipliers, click bonuses, golden cookie enhancements)
3. **Prestige System** (reset for permanent bonuses)
4. **Tech Tree** (unlock-based progression system)
5. **Threats/Challenges** (random events that add difficulty)

---

## 1. More Achievements System

### 1.1 Achievement Categories

#### Production Achievements
- **Cookie Mega Factory**: Reach 100,000 CPS
- **Cookie Galaxy**: Reach 1,000,000 CPS
- **Cookie Universe**: Reach 10,000,000 CPS
- **Infinite Cookies**: Reach 100,000,000 CPS

#### Collection Achievements
- **Cookie Trillionaire**: Earn 1 trillion total cookies
- **Cookie Quadrillionaire**: Earn 1 quadrillion total cookies
- **Ancient Baker**: Play for 1 hour
- **Dedicated Baker**: Play for 10 hours
- **Cookie Legend**: Play for 100 hours

#### Upgrade Achievements
- **Upgrade Collector**: Own 100 total upgrades
- **Upgrade Hoarder**: Own 250 total upgrades
- **Upgrade Lord**: Own 500 total upgrades
- **Max Cursor**: Own 100 cursors
- **Max Grandma**: Own 100 grandmas
- **Max Factory**: Own 100 factories

#### Special Achievements
- **Speed Clicker**: Click 10 times in 1 second
- **Click Combo**: Click 100 times in 10 seconds
- **Golden Master**: Click 100 golden cookies
- **Golden Legend**: Click 500 golden cookies
- **Prestigious Baker**: Complete your first prestige
- **Prestige Master**: Complete 10 prestiges

#### Secret Achievements
- **Lucky Seven**: Have exactly 7,777,777 cookies
- **The Answer**: Have exactly 42,000,000 cookies
- **Minimalist**: Reach 1,000 CPS with only cursors
- **Diversified**: Own at least 1 of every upgrade type

### 1.2 Implementation Files

**File: `src/utils/extendedAchievementConfig.js`**
```javascript
// Additional achievements beyond the base set
export const EXTENDED_ACHIEVEMENTS = [
  // Production category
  {
    id: "cookie_mega_factory",
    name: "Cookie Mega Factory",
    description: "Reach 100,000 cookies per second",
    icon: "[M]",
    category: "production",
    check: (state) => state.cookiesPerSecond >= 100000,
  },
  // ... more achievements
];

export const ACHIEVEMENT_CATEGORIES = [
  "production",
  "collection", 
  "upgrades",
  "special",
  "secret"
];
```

### 1.3 Achievement Rewards
- Some achievements grant small permanent bonuses
- Achievement milestones unlock special upgrades
- Visual badges/icons for achievement tiers

---

## 2. Special Upgrades System

### 2.1 Upgrade Types

#### Multiplier Upgrades
- **Reinforced Oven**: +5% CPS (unlocked at 1,000 cookies)
- **Industrial Mixer**: +10% CPS (unlocked at 100,000 cookies)
- **Cookie Optimizer**: +25% CPS (unlocked at 1,000,000 cookies)
- **Divine Blessing**: +50% CPS (unlocked at 10,000,000 cookies)

#### Click Power Upgrades
- **Stronger Fingers**: +1 click power
- **Ambidextrous Clicking**: +5 click power
- **Bionic Hand**: +25 click power
- **Godlike Touch**: +100 click power

#### Golden Cookie Upgrades
- **Golden Cookie Duration**: Increase golden cookie lifetime to 20s
- **Golden Cookie Frequency**: Spawn golden cookies 25% more often
- **Golden Cookie Power**: Increase multiplier from 7x to 10x
- **Golden Cookie Luck**: 50% chance for double bonus

#### Special Effects
- **Cookie Storm**: Passive chance for cookie rain events
- **Time Warp**: CPS builds up 10x faster for 20 seconds (active ability)
- **Cookie Shield**: Protect from threats for 1 minute
- **Lucky Charm**: 5% chance for double production each second

### 2.2 Implementation Files

**File: `src/utils/specialUpgradeConfig.js`**
```javascript
export const SPECIAL_UPGRADES = [
  {
    id: "reinforced_oven",
    name: "Reinforced Oven",
    description: "Increases cookie production by 5%",
    type: "multiplier",
    cost: 50000,
    effect: { type: "cps_multiplier", value: 1.05 },
    unlockCondition: (state) => state.totalCookiesEarned >= 1000,
    icon: "<O>",
  },
  // ... more special upgrades
];

export const UPGRADE_TYPES = {
  MULTIPLIER: "multiplier",
  CLICK_POWER: "click_power",
  GOLDEN_COOKIE: "golden_cookie",
  SPECIAL_EFFECT: "special_effect",
};
```

### 2.3 One-Time Purchase Model
- Special upgrades are purchased once (not quantity-based)
- Unlock conditions based on progression
- Effects stack additively/multiplicatively

---

## 3. Prestige System

### 3.1 Prestige Mechanics

#### How It Works
1. Player can prestige after earning 1 billion total cookies
2. Prestiging resets:
   - Cookie count to 0
   - Total cookies earned to 0
   - All upgrade quantities to 0
   - Play time (optional)
   - Achievements remain unlocked

3. Prestiging grants:
   - **Prestige Points** based on total cookies earned
   - Permanent CPS multiplier based on prestige points
   - Access to prestige-only upgrades
   - Prestige level counter

#### Prestige Points Calculation
```
Prestige Points = floor(sqrt(totalCookiesEarned / 1,000,000,000))
```

#### Prestige Multiplier
```
CPS Multiplier = 1 + (prestigePoints * 0.01)
```
- Each prestige point = +1% permanent CPS bonus
- Multiplies ALL cookie production

### 3.2 Prestige Upgrades

**Prestige Shop:**
- **Prestige Bonus I**: Cost 10 PP, +5% CPS
- **Prestige Bonus II**: Cost 25 PP, +10% CPS
- **Prestige Bonus III**: Cost 50 PP, +15% CPS
- **Lucky Prestige**: Cost 20 PP, +1% chance for double cookies
- **Prestige Golden Cookies**: Cost 30 PP, Golden cookies spawn 2x faster
- **Starting Boost**: Cost 40 PP, Start each prestige with 1,000 cookies

### 3.3 Implementation Files

**File: `src/composables/usePrestige.js`**
```javascript
import { ref, computed } from "vue";

export function usePrestige(gameState) {
  const prestigeLevel = ref(0);
  const prestigePoints = ref(0);
  const prestigeUpgrades = reactive({});
  
  const canPrestige = computed(() => {
    return gameState.totalCookiesEarned.value >= 1000000000;
  });
  
  const nextPrestigePoints = computed(() => {
    return calculatePrestigePoints(gameState.totalCookiesEarned.value);
  });
  
  const prestigeMultiplier = computed(() => {
    return 1 + (prestigePoints.value * 0.01);
  });
  
  function performPrestige() {
    if (!canPrestige.value) return false;
    
    // Award prestige points
    const points = calculatePrestigePoints(gameState.totalCookiesEarned.value);
    prestigePoints.value += points;
    prestigeLevel.value += 1;
    
    // Reset game state
    gameState.resetGame();
    
    return true;
  }
  
  return {
    prestigeLevel,
    prestigePoints,
    prestigeMultiplier,
    canPrestige,
    nextPrestigePoints,
    performPrestige,
  };
}
```

**File: `src/utils/prestigeUpgradeConfig.js`**
```javascript
export const PRESTIGE_UPGRADES = [
  {
    id: "prestige_bonus_1",
    name: "Prestige Bonus I",
    description: "Permanent +5% cookie production",
    cost: 10,
    effect: { type: "cps_multiplier", value: 1.05 },
  },
  // ... more prestige upgrades
];
```

---

## 4. Tech Tree System

### 4.1 Tech Tree Structure

#### Research Categories

**Production Research**
- **Basic Production** (Root)
  - → **Efficient Baking** (+10% cursor efficiency)
    - → **Master Baking** (+25% cursor efficiency)
  - → **Farm Optimization** (+10% farm efficiency)
    - → **Industrial Farming** (+25% farm efficiency)

**Technology Research**
- **Automation** (Root)
  - → **Auto-Upgrade I** (Auto-buy cheapest upgrade when affordable)
  - → **Auto-Clicker II** (Click power increased by upgrades)

**Golden Cookie Research**
- **Golden Studies** (Root)
  - → **Golden Detection** (Visual warning before golden cookie spawns)
  - → **Golden Extension** (+5 seconds to golden cookie duration)

**Prestige Research** (Unlocked after first prestige)
- **Prestige Efficiency** (Earn 10% more prestige points)
- **Fast Start** (Begin each prestige with more cookies)

### 4.2 Tech Point System

**Earning Tech Points:**
- Earn 1 tech point per 1 million total cookies earned
- Bonus tech points from achievements
- Bonus tech points from prestige

**Tech Costs:**
- Tier 1 techs: 5 tech points
- Tier 2 techs: 15 tech points  
- Tier 3 techs: 40 tech points
- Tier 4 techs: 100 tech points

### 4.3 Implementation Files

**File: `src/utils/techTreeConfig.js`**
```javascript
export const TECH_TREE = [
  {
    id: "efficient_baking",
    name: "Efficient Baking",
    description: "Cursors are 10% more efficient",
    category: "production",
    tier: 1,
    cost: 5,
    prerequisites: [],
    effect: { type: "upgrade_multiplier", upgradeId: "cursor", value: 1.1 },
  },
  {
    id: "master_baking",
    name: "Master Baking",
    description: "Cursors are 25% more efficient",
    category: "production",
    tier: 2,
    cost: 15,
    prerequisites: ["efficient_baking"],
    effect: { type: "upgrade_multiplier", upgradeId: "cursor", value: 1.25 },
  },
  // ... more tech tree nodes
];

export const TECH_CATEGORIES = [
  "production",
  "technology",
  "golden",
  "prestige"
];
```

**File: `src/composables/useTechTree.js`**
```javascript
import { ref, computed, reactive } from "vue";
import { TECH_TREE } from "../utils/techTreeConfig.js";

export function useTechTree(gameState) {
  const researchedTechs = reactive(new Set());
  
  const techPoints = computed(() => {
    return Math.floor(gameState.totalCookiesEarned.value / 1000000);
  });
  
  const availableTechPoints = ref(0);
  
  function canResearch(tech) {
    // Check cost
    if (availableTechPoints.value < tech.cost) return false;
    
    // Check prerequisites
    for (const prereqId of tech.prerequisites) {
      if (!researchedTechs.has(prereqId)) return false;
    }
    
    // Check not already researched
    return !researchedTechs.has(tech.id);
  }
  
  function researchTech(tech) {
    if (!canResearch(tech)) return false;
    
    availableTechPoints.value -= tech.cost;
    researchedTechs.add(tech.id);
    
    return true;
  }
  
  return {
    researchedTechs,
    techPoints,
    availableTechPoints,
    canResearch,
    researchTech,
  };
}
```

---

## 5. Threats/Challenges System

### 5.1 Threat Types

#### Random Events (Negative)
1. **Cookie Thief** (10% chance every 5 minutes)
   - Steals 5% of current cookies
   - Duration: Instant
   - Can be prevented with Cookie Shield upgrade

2. **Oven Breakdown** (5% chance every 10 minutes)
   - Reduces CPS by 50%
   - Duration: 30 seconds
   - Warning: "Your oven is smoking!"

3. **Grandma Strike** (5% chance every 15 minutes)
   - Grandmas stop producing
   - Duration: 60 seconds
   - Warning: "The grandmas demand better working conditions!"

4. **Cookie Spoilage** (3% chance every 20 minutes)
   - Reduces total cookies by 10%
   - Can't go below 0
   - Warning: "Some cookies have gone bad!"

#### Challenges (Optional Mini-Games)
1. **Click Frenzy Challenge**
   - Goal: Click 50 times in 10 seconds
   - Reward: 2x CPS for 1 minute

2. **Golden Cookie Rush**
   - Spawn 5 golden cookies in 30 seconds
   - Reward: Bonus golden cookie points

3. **Production Target**
   - Reach specific CPS in time limit
   - Reward: Unlock special upgrade

### 5.2 Threat Mitigation

**Defensive Upgrades:**
- **Cookie Insurance**: Reduces theft to 2%
- **Backup Generator**: Prevents oven breakdowns
- **Union Negotiator**: Prevents grandma strikes
- **Preservatives**: Prevents cookie spoilage

**Active Abilities:**
- **Cookie Shield**: 60-second immunity (cooldown: 10 minutes)
- **Emergency Production**: 10x CPS for 10 seconds (cooldown: 5 minutes)

### 5.3 Implementation Files

**File: `src/composables/useThreats.js`**
```javascript
import { ref, reactive, computed } from "vue";

export function useThreats(gameState) {
  const activeThreats = reactive([]);
  const threatHistory = ref([]);
  const lastThreatTime = ref(Date.now());
  
  // Threat definitions
  const THREATS = [
    {
      id: "cookie_thief",
      name: "Cookie Thief!",
      description: "A thief stole 5% of your cookies!",
      probability: 0.1,
      checkInterval: 300000, // 5 minutes
      effect: (state) => {
        const stolen = Math.floor(state.cookieCount.value * 0.05);
        state.cookieCount.value -= stolen;
        return { stolen };
      },
    },
    // ... more threats
  ];
  
  function checkForThreats() {
    const now = Date.now();
    
    for (const threat of THREATS) {
      if (now - lastThreatTime.value < threat.checkInterval) continue;
      
      if (Math.random() < threat.probability) {
        triggerThreat(threat);
        lastThreatTime.value = now;
      }
    }
  }
  
  function triggerThreat(threat) {
    const result = threat.effect(gameState);
    activeThreats.push({
      ...threat,
      result,
      timestamp: Date.now(),
    });
    
    // Remove after display
    setTimeout(() => {
      const index = activeThreats.findIndex(t => t.id === threat.id);
      if (index > -1) activeThreats.splice(index, 1);
    }, 5000);
  }
  
  return {
    activeThreats,
    checkForThreats,
  };
}
```

**File: `src/utils/threatConfig.js`**
```javascript
export const THREATS = [
  {
    id: "cookie_thief",
    name: "Cookie Thief!",
    description: "A thief is trying to steal your cookies!",
    type: "instant",
    severity: "medium",
    probability: 0.1,
    checkInterval: 300000,
  },
  // ... more threat configurations
];

export const DEFENSIVE_UPGRADES = [
  {
    id: "cookie_insurance",
    name: "Cookie Insurance",
    description: "Reduces theft damage by 60%",
    cost: 500000,
    protectsAgainst: ["cookie_thief"],
  },
  // ... more defensive upgrades
];
```

---

## 6. UI Components

### 6.1 New Components to Create

1. **`AchievementPanel.vue`** (Enhanced)
   - Category filtering
   - Progress bars for achievements
   - Achievement rewards display

2. **`SpecialUpgradesShop.vue`**
   - Special upgrade cards
   - Unlock status indicators
   - Effect descriptions

3. **`PrestigePanel.vue`**
   - Prestige confirmation dialog
   - Prestige points calculator
   - Prestige shop interface
   - Prestige upgrade list

4. **`TechTreePanel.vue`**
   - Visual tech tree graph
   - Tech point display
   - Research buttons
   - Prerequisites highlighting

5. **`ThreatsPanel.vue`**
   - Active threat warnings
   - Threat history log
   - Defense status

6. **`ChallengeModal.vue`**
   - Challenge instructions
   - Timer display
   - Progress tracking
   - Reward preview

### 6.2 UI Layout Updates

```
┌─────────────────────────────────────────────────────┐
│  Cookie Clicker  [Stats] [Prestige Lvl: 5]         │
├──────────────────────┬──────────────────────────────┤
│                      │ Tabs: [Shop] [Special]       │
│                      │       [Tech] [Prestige]      │
│                      ├──────────────────────────────┤
│        🍪           │ Stats Panel                   │
│    [BIG COOKIE]     │ Cookies: 1.2M                │
│                      │ CPS: 50K (×1.25 prestige)    │
│  [Threat Warning]   │ Tech Points: 42               │
│  ⚠ Oven Breakdown!  │ Next Prestige: 500K points   │
│                      ├──────────────────────────────┤
│  [Golden Cookie]    │ [Current Tab Content]        │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│ Achievements (15/40) | Threats: 🛡️ Protected       │
│ 🏆🏆🏆⭐⭐           | [Controls] [Save]            │
└─────────────────────────────────────────────────────┘
```

---

## 7. Implementation Order

### Phase 1: Extended Achievements (Days 1-2)
- [ ] Create `extendedAchievementConfig.js`
- [ ] Add 20+ new achievements
- [ ] Update achievement checking logic
- [ ] Add category filtering to UI
- [ ] Test achievement unlocking

### Phase 2: Special Upgrades (Days 3-4)
- [ ] Create `specialUpgradeConfig.js`
- [ ] Implement one-time purchase logic
- [ ] Add unlock conditions system
- [ ] Create `SpecialUpgradesShop.vue`
- [ ] Integrate multipliers into game state
- [ ] Test special upgrade effects

### Phase 3: Prestige System (Days 5-7)
- [ ] Create `usePrestige.js` composable
- [ ] Create `prestigeUpgradeConfig.js`
- [ ] Implement prestige calculation
- [ ] Add prestige confirmation dialog
- [ ] Create `PrestigePanel.vue`
- [ ] Integrate prestige multiplier into CPS
- [ ] Update save/load for prestige data
- [ ] Test prestige flow

### Phase 4: Tech Tree (Days 8-10)
- [ ] Create `techTreeConfig.js`
- [ ] Create `useTechTree.js` composable
- [ ] Implement tech point system
- [ ] Create `TechTreePanel.vue`
- [ ] Add prerequisite checking
- [ ] Apply tech effects to game
- [ ] Test tech tree progression

### Phase 5: Threats System (Days 11-12)
- [ ] Create `useThreats.js` composable
- [ ] Create `threatConfig.js`
- [ ] Implement threat checking intervals
- [ ] Create threat notification UI
- [ ] Add defensive upgrades
- [ ] Test threat triggering

### Phase 6: Integration & Polish (Days 13-14)
- [ ] Integrate all systems together
- [ ] Update main game loop
- [ ] Update save/load system
- [ ] Add tab navigation
- [ ] Balance testing
- [ ] Mobile responsiveness
- [ ] Final testing

---

## 8. Technical Considerations

### 8.1 State Management
- Prestige state stored separately
- Tech tree research stored as Set
- Special upgrades stored as boolean flags
- Threat timers managed independently

### 8.2 Save/Load Schema
```javascript
{
  // Existing
  cookieCount,
  totalCookiesEarned,
  upgrades,
  unlockedAchievementIds,
  
  // New
  prestigeLevel,
  prestigePoints,
  prestigeUpgrades: {},
  specialUpgrades: {},
  researchedTechs: [],
  threatHistory: [],
  lastThreatCheck: timestamp,
}
```

### 8.3 Performance
- Lazy load tech tree visualization
- Debounce achievement checks
- Efficient threat probability calculations
- Cache computed values where possible

### 8.4 Testing Strategy
- Unit tests for prestige calculations
- Integration tests for save/load
- Manual testing for all unlock conditions
- Balance testing for progression curve

---

## 9. Configuration & Balance

### 9.1 Progression Balance

**Early Game (0-1M cookies)**
- Focus on basic upgrades
- Simple achievements
- No threats yet

**Mid Game (1M-1B cookies)**
- Special upgrades unlock
- More challenging achievements
- Occasional threats
- Tech tree available

**Late Game (1B+ cookies)**
- Prestige becomes viable
- High-tier achievements
- Regular threats
- Full tech tree

**Prestige Loop**
- Each prestige should feel rewarding
- Progression faster than previous run
- New goals each prestige

### 9.2 Difficulty Settings (Future)
- Easy: Fewer threats, more golden cookies
- Normal: Balanced
- Hard: More threats, fewer golden cookies, higher costs

---

## 10. Future Enhancements

**Post-Implementation Ideas:**
- Cloud save system
- Leaderboards
- Seasonal events
- Mini-games
- Sound effects and music
- Cookie customization
- Multiplayer trading
- Automation scripts (late-game QoL)

---

## Summary

This implementation plan provides a comprehensive roadmap for expanding the Cookie Clicker game with engaging new systems. Each system is designed to:
- Extend gameplay depth
- Provide meaningful choices
- Reward long-term investment
- Keep players engaged through varied mechanics

The modular approach allows for incremental implementation and testing, with each phase building on the previous one.
