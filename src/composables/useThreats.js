// Threats composable for cookie clicker
import { ref, reactive, computed } from "vue";
import { 
  THREATS, 
  DEFENSIVE_UPGRADES,
  ACTIVE_ABILITIES,
  getActiveThreats,
  calculateThreatProbability,
  calculateThreatDamage 
} from "../utils/threatConfig.js";

export function useThreats(gameState) {
  // Active threats currently affecting the game
  const activeThreats = reactive([]);
  
  // Threat history (for display)
  const threatHistory = ref([]);
  
  // Last threat check time for each threat type
  const lastThreatChecks = reactive({});
  
  // Defensive upgrades purchased
  const defensiveUpgrades = reactive(gameState.defensiveUpgrades ?? {});
  
  // Active ability cooldowns
  const abilityCooldowns = reactive({});
  
  // Active challenges
  const activeChallenges = reactive([]);
  
  // Is shield active
  const shieldActive = ref(false);
  const shieldEndTime = ref(0);
  
  // Get available threats based on game state
  const availableThreats = computed(() => {
    return getActiveThreats({
      totalCookiesEarned: gameState.totalCookiesEarned.value,
      upgrades: gameState.upgrades,
      goldenCookiesCollected: gameState.goldenCookiesCollected?.value ?? 0,
    });
  });
  
  // Check if an ability is on cooldown
  function isAbilityOnCooldown(abilityId) {
    const cooldownEnd = abilityCooldowns[abilityId];
    return cooldownEnd && Date.now() < cooldownEnd;
  }
  
  // Activate an ability
  function activateAbility(abilityId) {
    const ability = ACTIVE_ABILITIES.find(a => a.id === abilityId);
    if (!ability) return false;
    
    // Check cooldown
    if (isAbilityOnCooldown(abilityId)) return false;
    
    // Activate based on type
    if (abilityId === "cookie_shield") {
      shieldActive.value = true;
      shieldEndTime.value = Date.now() + ability.duration;
      
      // Clear shield after duration
      setTimeout(() => {
        shieldActive.value = false;
        shieldEndTime.value = 0;
      }, ability.duration);
    }
    
    // Set cooldown
    abilityCooldowns[abilityId] = Date.now() + ability.cooldown;
    
    return true;
  }
  
  // Check for threats
  function checkForThreats() {
    if (shieldActive.value) return; // No threats while shield is active
    
    const now = Date.now();
    
    availableThreats.value.forEach(threat => {
      // Check if enough time has passed since last check
      const lastCheck = lastThreatChecks[threat.id] || 0;
      if (now - lastCheck < threat.checkInterval) return;
      
      // Update last check time
      lastThreatChecks[threat.id] = now;
      
      // Calculate probability with modifiers
      const probability = calculateThreatProbability(threat, defensiveUpgrades);
      
      // Roll for threat
      if (Math.random() < probability) {
        triggerThreat(threat);
      }
    });
  }
  
  // Trigger a threat
  function triggerThreat(threat) {
    const result = threat.effect({
      cookieCount: gameState.cookieCount.value,
      totalCookiesEarned: gameState.totalCookiesEarned.value,
      upgrades: gameState.upgrades,
    });
    
    if (threat.type === "instant") {
      // Apply instant effect
      if (result.stolen) {
        const actualStolen = calculateThreatDamage(threat, result.stolen, defensiveUpgrades);
        gameState.cookieCount.value = Math.max(0, gameState.cookieCount.value - actualStolen);
        result.message = `Lost ${actualStolen.toLocaleString()} cookies!`;
      }
      
      // Add to history
      addToHistory(threat, result);
      
    } else if (threat.type === "duration") {
      // Add to active threats
      const activeThreat = {
        ...threat,
        result,
        startTime: Date.now(),
        endTime: Date.now() + threat.duration,
      };
      
      activeThreats.push(activeThreat);
      addToHistory(threat, result);
      
      // Remove after duration
      setTimeout(() => {
        const index = activeThreats.findIndex(t => t.id === threat.id);
        if (index > -1) activeThreats.splice(index, 1);
      }, threat.duration);
      
    } else if (threat.type === "challenge") {
      // Start challenge
      const challenge = {
        ...threat,
        startTime: Date.now(),
        endTime: Date.now() + threat.duration,
        progress: 0,
        completed: false,
      };
      
      activeChallenges.push(challenge);
      
      // Auto-fail after duration
      setTimeout(() => {
        const index = activeChallenges.findIndex(c => c.id === threat.id);
        if (index > -1 && !activeChallenges[index].completed) {
          activeChallenges.splice(index, 1);
          addToHistory(threat, { message: "Challenge failed!" });
        }
      }, threat.duration);
    }
  }
  
  // Add threat to history
  function addToHistory(threat, result) {
    threatHistory.value.unshift({
      ...threat,
      result,
      timestamp: Date.now(),
    });
    
    // Keep only last 20 threats
    if (threatHistory.value.length > 20) {
      threatHistory.value = threatHistory.value.slice(0, 20);
    }
  }
  
  // Update challenge progress
  function updateChallengeProgress(challengeId, progress) {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    challenge.progress = progress;
    
    // Check if completed
    if (challenge.id === "click_frenzy_challenge" && progress >= challenge.requirement.clicks) {
      completeChallenge(challenge);
    } else if (challenge.id === "golden_cookie_rush" && progress >= challenge.requirement.goldenCookies) {
      completeChallenge(challenge);
    }
  }
  
  // Complete a challenge
  function completeChallenge(challenge) {
    const reward = challenge.reward({
      totalCookiesEarned: gameState.totalCookiesEarned.value,
    });
    
    challenge.completed = true;
    addToHistory(challenge, { message: `Challenge completed! ${reward.message}` });
    
    // Remove from active challenges
    const index = activeChallenges.findIndex(c => c.id === challenge.id);
    if (index > -1) activeChallenges.splice(index, 1);
    
    // Apply reward (this should be handled by the game)
    return reward;
  }
  
  // Buy defensive upgrade
  function buyDefensiveUpgrade(upgrade) {
    if (defensiveUpgrades[upgrade.id] || gameState.cookieCount.value < upgrade.cost) {
      return false;
    }
    
    gameState.cookieCount.value -= upgrade.cost;
    defensiveUpgrades[upgrade.id] = true;
    return true;
  }
  
  // Get serializable state
  function getSerializableState() {
    return {
      defensiveUpgrades: { ...defensiveUpgrades },
      threatHistory: threatHistory.value.slice(0, 10), // Save last 10
      lastThreatChecks: { ...lastThreatChecks },
    };
  }
  
  // Load state
  function loadState(state) {
    if (state.defensiveUpgrades) {
      Object.keys(state.defensiveUpgrades).forEach(key => {
        defensiveUpgrades[key] = state.defensiveUpgrades[key];
      });
    }
    if (state.threatHistory) {
      threatHistory.value = state.threatHistory;
    }
    if (state.lastThreatChecks) {
      Object.keys(state.lastThreatChecks).forEach(key => {
        lastThreatChecks[key] = state.lastThreatChecks[key];
      });
    }
  }
  
  return {
    // State
    activeThreats,
    threatHistory,
    defensiveUpgrades,
    activeChallenges,
    shieldActive,
    availableThreats,
    
    // Methods
    checkForThreats,
    activateAbility,
    isAbilityOnCooldown,
    updateChallengeProgress,
    buyDefensiveUpgrade,
    getSerializableState,
    loadState,
  };
}
