import { ref, reactive, computed, onUnmounted } from "vue";
import { SAUSAGE_UPGRADES, calculateSausageUpgradeCost } from "../utils/sausageUpgradeConfig.js";

// Base click power (sausages per manual click)
export const BASE_CLICK_POWER = 1;

// Auto-clicker tick rate (milliseconds)
export const TICK_RATE = 100;

export function useSausageState(initialState = null) {
  // Core game state
  const sausageCount = ref(initialState?.sausageCount ?? 0);
  const totalSausagesEarned = ref(initialState?.totalSausagesEarned ?? 0);
  const totalClicks = ref(initialState?.totalClicks ?? 0);
  const isGameRunning = ref(true);

  // Upgrade quantities
  const upgrades = reactive({
    grill: initialState?.upgrades?.grill ?? 0,
    butcher: initialState?.upgrades?.butcher ?? 0,
    pig_farm: initialState?.upgrades?.pig_farm ?? 0,
    smokehouse: initialState?.upgrades?.smokehouse ?? 0,
    sausage_factory: initialState?.upgrades?.sausage_factory ?? 0,
  });

  const unlockedAchievementIds = ref(
    new Set(initialState?.unlockedAchievementIds ?? []),
  );

  const newlyUnlockedAchievements = ref([]);

  const sausagesPerSecond = computed(() => {
    return SAUSAGE_UPGRADES.reduce((total, upgrade) => {
      const quantity = upgrades[upgrade.id] || 0;
      return total + quantity * upgrade.sps;
    }, 0);
  });

  const sausagesPerTick = computed(() => {
    return sausagesPerSecond.value / (1000 / TICK_RATE);
  });

  const clickPower = computed(() => {
    const grillBonus = (upgrades.grill || 0) * 0.1;
    return BASE_CLICK_POWER + grillBonus;
  });

  let autoClickerInterval = null;

  function clickSausage() {
    sausageCount.value += clickPower.value;
    totalSausagesEarned.value += clickPower.value;
    totalClicks.value += 1;
  }

  function buyUpgrade(upgrade) {
    const cost = calculateSausageUpgradeCost(
      upgrade.baseCost,
      upgrades[upgrade.id] || 0,
    );

    if (sausageCount.value >= cost) {
      sausageCount.value -= cost;
      upgrades[upgrade.id] = (upgrades[upgrade.id] || 0) + 1;
      return true;
    }
    return false;
  }

  function autoClickerTick() {
    if (sausagesPerTick.value > 0) {
      const earned = sausagesPerTick.value;
      sausageCount.value += earned;
      totalSausagesEarned.value += earned;
    }
  }

  function startAutoClicker() {
    if (autoClickerInterval) return;
    autoClickerInterval = setInterval(() => {
      autoClickerTick();
    }, TICK_RATE);
  }

  function stopAutoClicker() {
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval);
      autoClickerInterval = null;
    }
  }

  function unlockAchievement(achievement) {
    if (!unlockedAchievementIds.value.has(achievement.id)) {
      unlockedAchievementIds.value.add(achievement.id);
      newlyUnlockedAchievements.value.push(achievement);
    }
  }

  function clearNewlyUnlockedAchievements() {
    newlyUnlockedAchievements.value = [];
  }

  function resetGame() {
    sausageCount.value = 0;
    totalSausagesEarned.value = 0;
    totalClicks.value = 0;
    Object.keys(upgrades).forEach((key) => (upgrades[key] = 0));
    unlockedAchievementIds.value.clear();
    newlyUnlockedAchievements.value = [];
  }

  function getSerializableState() {
    return {
      sausageCount: sausageCount.value,
      totalSausagesEarned: totalSausagesEarned.value,
      totalClicks: totalClicks.value,
      upgrades: { ...upgrades },
      unlockedAchievementIds: Array.from(unlockedAchievementIds.value),
    };
  }

  onUnmounted(() => {
    stopAutoClicker();
  });

  return {
    sausageCount,
    totalSausagesEarned,
    totalClicks,
    sausagesPerSecond,
    clickPower,
    upgrades,
    unlockedAchievementIds,
    newlyUnlockedAchievements,
    clickSausage,
    buyUpgrade,
    startAutoClicker,
    stopAutoClicker,
    unlockAchievement,
    clearNewlyUnlockedAchievements,
    resetGame,
    getSerializableState,
  };
}
