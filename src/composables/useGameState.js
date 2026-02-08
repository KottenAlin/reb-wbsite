import { ref, reactive, computed, onUnmounted } from "vue";
import { UPGRADES, calculateUpgradeCost } from "../utils/upgradeConfig.js";

// Base click power (cookies per manual click)
export const BASE_CLICK_POWER = 1;

// Auto-clicker tick rate (milliseconds)
export const TICK_RATE = 100;

export function useGameState(initialState = null) {
  // Core game state
  const cookieCount = ref(initialState?.cookieCount ?? 0);
  const totalCookiesEarned = ref(initialState?.totalCookiesEarned ?? 0);
  const totalClicks = ref(initialState?.totalClicks ?? 0);
  const playTime = ref(initialState?.playTime ?? 0);
  const isGameRunning = ref(true);

  // Upgrade quantities (key-value pairs)
  const upgrades = reactive({
    cursor: initialState?.upgrades?.cursor ?? 0,
    grandma: initialState?.upgrades?.grandma ?? 0,
    farm: initialState?.upgrades?.farm ?? 0,
    mine: initialState?.upgrades?.mine ?? 0,
    factory: initialState?.upgrades?.factory ?? 0,
  });

  // Achievement IDs that have been unlocked
  const unlockedAchievementIds = ref(
    new Set(initialState?.unlockedAchievementIds ?? []),
  );

  // Newly unlocked achievements (for notification display)
  const newlyUnlockedAchievements = ref([]);

  // Calculate cookies per second (CPS) from all upgrades
  const cookiesPerSecond = computed(() => {
    return UPGRADES.reduce((total, upgrade) => {
      const quantity = upgrades[upgrade.id] || 0;
      return total + quantity * upgrade.cps;
    }, 0);
  });

  // Calculate cookies per auto-tick (TICK_RATE)
  const cookiesPerTick = computed(() => {
    return cookiesPerSecond.value / (1000 / TICK_RATE);
  });

  // Calculate click power (base + bonus from upgrades)
  const clickPower = computed(() => {
    // Click power increases with upgrades (1 base + 0.1 for each cursor)
    const cursorBonus = (upgrades.cursor || 0) * 0.1;
    return BASE_CLICK_POWER + cursorBonus;
  });

  // Auto-clicker interval reference
  let autoClickerInterval = null;

  // Play time interval reference
  let playTimeInterval = null;

  // Handle manual cookie click
  function clickCookie() {
    cookieCount.value += clickPower.value;
    totalCookiesEarned.value += clickPower.value;
    totalClicks.value += 1;
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

  // Auto-clicker tick function
  function autoClickerTick() {
    if (cookiesPerTick.value > 0) {
      const earned = cookiesPerTick.value;
      cookieCount.value += earned;
      totalCookiesEarned.value += earned;
    }
  }

  // Start the auto-clicker
  function startAutoClicker() {
    if (autoClickerInterval) return;

    autoClickerInterval = setInterval(() => {
      autoClickerTick();
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
    playTime.value = 0;

    Object.keys(upgrades).forEach((key) => {
      upgrades[key] = 0;
    });

    unlockedAchievementIds.value = new Set();
    newlyUnlockedAchievements.value = [];
  }

  // Pause the game
  function pauseGame() {
    isGameRunning.value = false;
    stopAutoClicker();
    stopPlayTimeTracker();
  }

  // Resume the game
  function resumeGame() {
    isGameRunning.value = true;
    startAutoClicker();
    startPlayTimeTracker();
  }

  // Get serializable state for saving
  function getSerializableState() {
    return {
      cookieCount: cookieCount.value,
      totalCookiesEarned: totalCookiesEarned.value,
      totalClicks: totalClicks.value,
      playTime: playTime.value,
      upgrades: { ...upgrades },
      unlockedAchievementIds: Array.from(unlockedAchievementIds.value),
      timestamp: Date.now(),
    };
  }

  // Start all game systems
  function startGame() {
    startAutoClicker();
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
    playTime,
    upgrades,
    cookiesPerSecond,
    cookiesPerTick,
    clickPower,
    isGameRunning,
    unlockedAchievementIds,
    newlyUnlockedAchievements,

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
  };
}
