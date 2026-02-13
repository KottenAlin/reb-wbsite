// Prestige system composable for cookie clicker
import { ref, computed, reactive } from "vue";
import { useSound } from "./useSound.js";

// Minimum cookies needed to prestige (1 billion)
export const PRESTIGE_THRESHOLD = 1000000000;

// Calculate prestige points from total cookies earned
export function calculatePrestigePoints(totalCookiesEarned) {
  if (totalCookiesEarned < PRESTIGE_THRESHOLD) {
    return 0;
  }
  return Math.floor(Math.sqrt(totalCookiesEarned / PRESTIGE_THRESHOLD));
}

// Calculate CPS multiplier from prestige points
export function calculatePrestigeMultiplier(prestigePoints, prestigeUpgrades) {
  let multiplier = 1 + (prestigePoints * 0.01); // Base: 1% per point
  
  // Add prestige upgrade bonuses
  if (prestigeUpgrades.prestige_bonus_1) multiplier *= 1.05;
  if (prestigeUpgrades.prestige_bonus_2) multiplier *= 1.10;
  if (prestigeUpgrades.prestige_bonus_3) multiplier *= 1.15;
  
  return multiplier;
}

export function usePrestige(gameState) {
  const { playSound } = useSound();

  // Prestige data
  const prestigeLevel = ref(gameState.prestigeLevel?.value ?? 0);
  const prestigePoints = ref(gameState.prestigePoints?.value ?? 0);
  const totalPrestigePoints = ref(gameState.totalPrestigePoints?.value ?? 0);
  const prestigeUpgrades = reactive(gameState.prestigeUpgrades ?? {});
  
  // Calculate if player can prestige
  const canPrestige = computed(() => {
    return gameState.totalCookiesEarned.value >= PRESTIGE_THRESHOLD;
  });
  
  // Calculate prestige points player would get
  const nextPrestigePoints = computed(() => {
    return calculatePrestigePoints(gameState.totalCookiesEarned.value);
  });
  
  // Calculate available prestige points for spending
  const availablePrestigePoints = computed(() => {
    return prestigePoints.value;
  });
  
  // Calculate current prestige multiplier
  const prestigeMultiplier = computed(() => {
    return calculatePrestigeMultiplier(totalPrestigePoints.value, prestigeUpgrades);
  });
  
  // Perform prestige
  function performPrestige() {
    if (!canPrestige.value) {
      return false;
    }
    
    // Calculate and award prestige points
    const points = nextPrestigePoints.value;
    prestigePoints.value += points;
    totalPrestigePoints.value += points;
    prestigeLevel.value += 1;
    
    // Update game state prestige level
    if (gameState.prestigeLevel) {
      gameState.prestigeLevel.value = prestigeLevel.value;
    }
    
    playSound('prestige');
    
    // Reset game (this will be called by the game)
    // gameState.resetGame();
    
    return true;
  }
  
  // Buy prestige upgrade
  function buyPrestigeUpgrade(upgrade) {
    if (prestigeUpgrades[upgrade.id] || prestigePoints.value < upgrade.cost) {
      return false;
    }
    
    prestigePoints.value -= upgrade.cost;
    prestigeUpgrades[upgrade.id] = true;
    playSound('buy');
    return true;
  }
  
  // Get serializable prestige state
  function getSerializableState() {
    return {
      prestigeLevel: prestigeLevel.value,
      prestigePoints: prestigePoints.value,
      totalPrestigePoints: totalPrestigePoints.value,
      prestigeUpgrades: { ...prestigeUpgrades },
    };
  }
  
  // Load prestige state
  function loadState(state) {
    if (state.prestigeLevel !== undefined) prestigeLevel.value = state.prestigeLevel;
    if (state.prestigePoints !== undefined) prestigePoints.value = state.prestigePoints;
    if (state.totalPrestigePoints !== undefined) totalPrestigePoints.value = state.totalPrestigePoints;
    if (state.prestigeUpgrades) {
      Object.keys(state.prestigeUpgrades).forEach(key => {
        prestigeUpgrades[key] = state.prestigeUpgrades[key];
      });
    }
  }
  
  return {
    // State
    prestigeLevel,
    prestigePoints,
    totalPrestigePoints,
    prestigeUpgrades,
    canPrestige,
    nextPrestigePoints,
    availablePrestigePoints,
    prestigeMultiplier,
    
    // Methods
    performPrestige,
    buyPrestigeUpgrade,
    getSerializableState,
    loadState,
  };
}
