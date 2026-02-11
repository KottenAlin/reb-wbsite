import { ref, reactive, computed, onUnmounted } from "vue";
import { UPGRADES, calculateUpgradeCost } from "../utils/upgradeConfig.js";
import { 
  calculateCPSMultiplier, 
  calculateClickPowerBonus,
  getGoldenCookieModifiers 
} from "../utils/specialUpgradeConfig.js";
import { calculatePrestigeMultiplier } from "./usePrestige.js";

// Base click power (cookies per manual click)
export const BASE_CLICK_POWER = 1;

// Auto-clicker tick rate (milliseconds)
export const TICK_RATE = 100;

export function useGameState(initialState = null) {
  // Core game state
  const cookieCount = ref(initialState?.cookieCount ?? 0);
  const totalCookiesEarned = ref(initialState?.totalCookiesEarned ?? 0);
  const totalClicks = ref(initialState?.totalClicks ?? 0);
  const goldenCookiesCollected = ref(initialState?.goldenCookiesCollected ?? 0);
  const playTime = ref(initialState?.playTime ?? 0);
  const isGameRunning = ref(true);

  // New state for achievements
  const speedClickRecord = ref(initialState?.speedClickRecord ?? 0);
  const clickComboRecord = ref(initialState?.clickComboRecord ?? 0);
  const prestigeLevel = ref(initialState?.prestigeLevel ?? 0);

  // Click tracking for speed/combo achievements
  const recentClicks = ref([]);

  // Special upgrades (one-time purchases)
  const specialUpgrades = reactive(initialState?.specialUpgrades ?? {});

  // Prestige data
  const prestigePoints = ref(initialState?.prestigePoints ?? 0);
  const totalPrestigePoints = ref(initialState?.totalPrestigePoints ?? 0);
  const prestigeUpgrades = reactive(initialState?.prestigeUpgrades ?? {});

  // Upgrade quantities (key-value pairs)
  const upgrades = reactive({
    cursor: initialState?.upgrades?.cursor ?? 0,
    grandma: initialState?.upgrades?.grandma ?? 0,
    farm: initialState?.upgrades?.farm ?? 0,
    mine: initialState?.upgrades?.mine ?? 0,
    factory: initialState?.upgrades?.factory ?? 0,
    bank: initialState?.upgrades?.bank ?? 0,
    temple: initialState?.upgrades?.temple ?? 0,
    wizard_tower: initialState?.upgrades?.wizard_tower ?? 0,
  });

  // Achievement IDs that have been unlocked
  const unlockedAchievementIds = ref(
    new Set(initialState?.unlockedAchievementIds ?? []),
  );

  // Newly unlocked achievements (for notification display)
  const newlyUnlockedAchievements = ref([]);

  // Calculate cookies per second (CPS) from all upgrades
  const cookiesPerSecond = computed(() => {
    const baseCPS = UPGRADES.reduce((total, upgrade) => {
      const quantity = upgrades[upgrade.id] || 0;
      return total + quantity * upgrade.cps;
    }, 0);
    
    // Apply special upgrade multipliers
    const specialMultiplier = calculateCPSMultiplier(specialUpgrades);
    
    // Apply prestige multiplier
    const prestigeMultiplier = calculatePrestigeMultiplier(totalPrestigePoints.value, prestigeUpgrades);
    
    return baseCPS * specialMultiplier * prestigeMultiplier;
  });

  // Calculate cookies per auto-tick (TICK_RATE)
  const cookiesPerTick = computed(() => {
    return cookiesPerSecond.value / (1000 / TICK_RATE);
  });

  // Calculate click power (base + bonus from upgrades + special upgrades)
  const clickPower = computed(() => {
    // Click power increases with upgrades (1 base + 0.1 for each cursor)
    const cursorBonus = (upgrades.cursor || 0) * 0.1;
    const specialBonus = calculateClickPowerBonus(specialUpgrades);
    return BASE_CLICK_POWER + cursorBonus + specialBonus;
  });

  // Auto-clicker interval reference
  let autoClickerInterval = null;

  // Play time interval reference
  let playTimeInterval = null;

  // Handle manual cookie click (with optional multiplier for golden cookie)
  function clickCookie(multiplier = 1) {
    const earned = clickPower.value * multiplier;
    cookieCount.value += earned;
    totalCookiesEarned.value += earned;
    totalClicks.value += 1;

    // Track click timing for speed/combo achievements
    const now = Date.now();
    recentClicks.value.push(now);

    // Remove clicks older than 10 seconds
    recentClicks.value = recentClicks.value.filter(time => now - time <= 10000);

    // Check speed click (10 clicks in 1 second)
    const clicksInLastSecond = recentClicks.value.filter(time => now - time <= 1000).length;
    if (clicksInLastSecond > speedClickRecord.value) {
      speedClickRecord.value = clicksInLastSecond;
    }

    // Check click combo (clicks in last 10 seconds)
    const clicksInLast10Seconds = recentClicks.value.length;
    if (clicksInLast10Seconds > clickComboRecord.value) {
      clickComboRecord.value = clicksInLast10Seconds;
    }
  }

  // Handle upgrade purchase
  function buyUpgrade(upgrade) {
    const cost = calculateUpgradeCost(
      upgrade.baseCost,
      upgrades[upgrade.id] || 0,
    );

    if (cookieCount.value >= cost) {
      cookieCount.value -= cost;
      upgrades[upgrade.id] = (upgrades[upgrade.id] || 0) + 1;
      return true;
    }
    return false;
  }

  // Handle special upgrade purchase
  function buySpecialUpgrade(upgrade) {
    if (specialUpgrades[upgrade.id] || cookieCount.value < upgrade.cost) {
      return false;
    }
    
    cookieCount.value -= upgrade.cost;
    specialUpgrades[upgrade.id] = true;
    return true;
  }

  // Auto-clicker tick function (with optional multiplier for golden cookie)
  function autoClickerTick(multiplier = 1) {
    if (cookiesPerTick.value > 0) {
      const earned = cookiesPerTick.value * multiplier;
      cookieCount.value += earned;
      totalCookiesEarned.value += earned;
    }
  }

  // Start the auto-clicker (with optional multiplier function for golden cookie)
  function startAutoClicker(getMultiplier = () => 1) {
    if (autoClickerInterval) return;

    autoClickerInterval = setInterval(() => {
      autoClickerTick(getMultiplier());
    }, TICK_RATE);
  }

  // Stop the auto-clicker
  function stopAutoClicker() {
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval);
      autoClickerInterval = null;
    }
  }

  // Start tracking play time
  function startPlayTimeTracker() {
    if (playTimeInterval) return;

    playTimeInterval = setInterval(() => {
      playTime.value += 1;
    }, 1000);
  }

  // Stop tracking play time
  function stopPlayTimeTracker() {
    if (playTimeInterval) {
      clearInterval(playTimeInterval);
      playTimeInterval = null;
    }
  }

  // Add unlocked achievement to newly unlocked list
  function unlockAchievement(achievement) {
    unlockedAchievementIds.value.add(achievement.id);
    newlyUnlockedAchievements.value.push(achievement);
  }

  // Clear newly unlocked achievements list
  function clearNewlyUnlockedAchievements() {
    newlyUnlockedAchievements.value = [];
  }

  // Reset the game
  function resetGame() {
    cookieCount.value = 0;
    totalCookiesEarned.value = 0;
    totalClicks.value = 0;
    goldenCookiesCollected.value = 0;
    playTime.value = 0;
    recentClicks.value = [];
    // Don't reset records, prestige level, and special upgrades - they persist

    Object.keys(upgrades).forEach((key) => {
      upgrades[key] = 0;
    });

    // Don't reset special upgrades on normal reset
    // They persist across prestiges

    unlockedAchievementIds.value = new Set();
    newlyUnlockedAchievements.value = [];
  }

  // Pause the game
  function pauseGame() {
    isGameRunning.value = false;
    stopAutoClicker();
    stopPlayTimeTracker();
  }

  // Resume the game (with optional multiplier function for golden cookie)
  function resumeGame(getMultiplier = () => 1) {
    isGameRunning.value = true;
    startAutoClicker(getMultiplier);
    startPlayTimeTracker();
  }

  // Get serializable state for saving
  function getSerializableState() {
    return {
      cookieCount: cookieCount.value,
      totalCookiesEarned: totalCookiesEarned.value,
      totalClicks: totalClicks.value,
      goldenCookiesCollected: goldenCookiesCollected.value,
      playTime: playTime.value,
      upgrades: { ...upgrades },
      specialUpgrades: { ...specialUpgrades },
      prestigeLevel: prestigeLevel.value,
      prestigePoints: prestigePoints.value,
      totalPrestigePoints: totalPrestigePoints.value,
      prestigeUpgrades: { ...prestigeUpgrades },
      unlockedAchievementIds: Array.from(unlockedAchievementIds.value),
      speedClickRecord: speedClickRecord.value,
      clickComboRecord: clickComboRecord.value,
      timestamp: Date.now(),
    };
  }

  // Start all game systems (with optional multiplier function for golden cookie)
  function startGame(getMultiplier = () => 1) {
    startAutoClicker(getMultiplier);
    startPlayTimeTracker();
    isGameRunning.value = true;
  }

  // Clean up intervals on unmount
  onUnmounted(() => {
    stopAutoClicker();
    stopPlayTimeTracker();
  });

  return {
    // State
    cookieCount,
    totalCookiesEarned,
    totalClicks,
    goldenCookiesCollected,
    playTime,
    upgrades,
    specialUpgrades,
    prestigeLevel,
    prestigePoints,
    totalPrestigePoints,
    prestigeUpgrades,
    cookiesPerSecond,
    cookiesPerTick,
    clickPower,
    isGameRunning,
    unlockedAchievementIds,
    newlyUnlockedAchievements,
    speedClickRecord,
    clickComboRecord,

    // Methods
    clickCookie,
    unlockAchievement,
    clearNewlyUnlockedAchievements,
    resetGame,
    pauseGame,
    resumeGame,
    startGame,
    getSerializableState,
    buyUpgrade,
    buySpecialUpgrade,
  };
}
