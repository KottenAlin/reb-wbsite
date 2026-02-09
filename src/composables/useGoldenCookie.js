import { ref, onUnmounted } from "vue";

// Golden cookie spawn configuration
const MIN_SPAWN_INTERVAL = 60000; // 1 minute
const MAX_SPAWN_INTERVAL = 180000; // 3 minutes
const COOKIE_LIFETIME = 13000; // 13 seconds visible
const GOLDEN_COOKIE_MULTIPLIER = 7; // 7x bonus for 77 seconds

export function useGoldenCookie() {
  const isGoldenCookieActive = ref(false);
  const goldenCookiePosition = ref({ x: 0, y: 0 });
  const goldenCookieBonus = ref(1); // Current multiplier
  const goldenCookieBonusTimeRemaining = ref(0);

  let spawnTimeout = null;
  let despawnTimeout = null;
  let bonusInterval = null;

  // Spawn a golden cookie at random position
  function spawnGoldenCookie() {
    // Random position (10-90% of viewport to avoid edges)
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;

    goldenCookiePosition.value = { x, y };
    isGoldenCookieActive.value = true;

    // Auto-despawn after lifetime expires
    despawnTimeout = setTimeout(() => {
      despawnGoldenCookie();
    }, COOKIE_LIFETIME);
  }

  // Remove golden cookie without collecting it
  function despawnGoldenCookie() {
    isGoldenCookieActive.value = false;
    scheduleNextSpawn();
  }

  // Collect golden cookie and activate bonus
  function collectGoldenCookie() {
    if (!isGoldenCookieActive.value) return null;

    isGoldenCookieActive.value = false;

    // Clear despawn timeout
    if (despawnTimeout) {
      clearTimeout(despawnTimeout);
      despawnTimeout = null;
    }

    // Activate bonus
    goldenCookieBonus.value = GOLDEN_COOKIE_MULTIPLIER;
    goldenCookieBonusTimeRemaining.value = 77;

    // Start bonus countdown
    if (bonusInterval) clearInterval(bonusInterval);
    bonusInterval = setInterval(() => {
      goldenCookieBonusTimeRemaining.value -= 1;

      if (goldenCookieBonusTimeRemaining.value <= 0) {
        clearInterval(bonusInterval);
        bonusInterval = null;
        goldenCookieBonus.value = 1;
      }
    }, 1000);

    scheduleNextSpawn();

    return {
      multiplier: GOLDEN_COOKIE_MULTIPLIER,
      duration: 77,
    };
  }

  // Schedule next golden cookie spawn
  function scheduleNextSpawn() {
    if (spawnTimeout) {
      clearTimeout(spawnTimeout);
    }

    const delay = Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) + MIN_SPAWN_INTERVAL;

    spawnTimeout = setTimeout(() => {
      spawnGoldenCookie();
    }, delay);
  }

  // Start the golden cookie system
  function startGoldenCookies() {
    scheduleNextSpawn();
  }

  // Stop the golden cookie system
  function stopGoldenCookies() {
    if (spawnTimeout) {
      clearTimeout(spawnTimeout);
      spawnTimeout = null;
    }
    if (despawnTimeout) {
      clearTimeout(despawnTimeout);
      despawnTimeout = null;
    }
    if (bonusInterval) {
      clearInterval(bonusInterval);
      bonusInterval = null;
    }
    isGoldenCookieActive.value = false;
  }

  // Clean up on unmount
  onUnmounted(() => {
    stopGoldenCookies();
  });

  return {
    isGoldenCookieActive,
    goldenCookiePosition,
    goldenCookieBonus,
    goldenCookieBonusTimeRemaining,
    collectGoldenCookie,
    startGoldenCookies,
    stopGoldenCookies,
  };
}
