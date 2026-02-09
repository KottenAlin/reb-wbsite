<script setup>
import { onMounted, watch, ref } from "vue";
import { useGameState } from "./composables/useGameState";
import { useGoldenCookie } from "./composables/useGoldenCookie";
import { UPGRADES, calculateUpgradeCost } from "./utils/upgradeConfig";
import { ACHIEVEMENTS, checkAchievements } from "./utils/achievementConfig";
import SausageSite from "./components/SausageSite.vue";

// Navigation state
const currentPage = ref("cookies");
const currentPage = ref("cookies");

// Load initial state from localStorage
const SAVE_KEY = "cookie_clicker_save";
const savedData = localStorage.getItem(SAVE_KEY);
const initialState = savedData ? JSON.parse(savedData) : null;

const game = useGameState(initialState);
const goldenCookie = useGoldenCookie();

// Start game on mount
onMounted(() => {
  game.startGame(() => goldenCookie.goldenCookieBonus.value);
  goldenCookie.startGoldenCookies();

  // Auto-save every 30 seconds
  setInterval(() => {
    saveGame();
  }, 30000);
});

// Check for achievements whenever game state changes
watch(
  [game.totalClicks, game.totalCookiesEarned, game.cookiesPerSecond, game.goldenCookiesCollected, game.upgrades],
  () => {
    const newlyUnlocked = checkAchievements(
      {
        totalClicks: game.totalClicks.value,
        totalCookiesEarned: game.totalCookiesEarned.value,
        cookiesPerSecond: game.cookiesPerSecond.value,
        goldenCookiesCollected: game.goldenCookiesCollected.value,
        upgrades: game.upgrades,
      },
      game.unlockedAchievementIds.value
    );

    newlyUnlocked.forEach((achievement) => {
      game.unlockAchievement(achievement);
    });
  },
  { deep: true }
);

function saveGame() {
  const state = game.getSerializableState();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  console.log("Game saved!");
}

function handleReset() {
  if (confirm("Are you sure you want to reset all progress?")) {
    game.resetGame();
    localStorage.removeItem(SAVE_KEY);
  }
}

function handleGoldenCookieClick() {
  const bonus = goldenCookie.collectGoldenCookie();
  if (bonus) {
    game.goldenCookiesCollected.value += 1;
  }
}

// Formatting helpers
const formatNumber = (num) => Math.floor(num).toLocaleString();
const formatCPS = (num) => num.toFixed(1);
</script>

<template>
  <div class="site-wrapper">
    <nav class="main-nav">
      <button
        :class="{ active: currentPage === 'cookies' }"
        @click="currentPage = 'cookies'"
      >
        Cookie Clicker
      </button>
      <button
        :class="{ active: currentPage === 'sausages' }"
        @click="currentPage = 'sausages'"
      >
        Sausage Sanctuary
      </button>
      <button
        :class="{ active: currentPage === 'cookies' }"
        @click="currentPage = 'cookies'"
      >
        Cookie Clicker
      </button>
      <button
        :class="{ active: currentPage === 'sausages' }"
        @click="currentPage = 'sausages'"
      >
        Sausage Sanctuary
      </button>
    </nav>

    <div v-if="currentPage === 'cookies'" class="game-container">
      <header class="game-header">
        <h1>Cookie Clicker</h1>
        <div class="main-stats">
          <div class="stat-item">
            <span class="label">Cookies:</span>
            <span class="value">{{ formatNumber(game.cookieCount.value) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">per second:</span>
            <span class="value">{{ formatCPS(game.cookiesPerSecond.value) }}</span>
          </div>
        </div>
      </header>

      <main class="game-layout">
        <!-- Left Column: Clicking Area -->
        <section class="click-section">
          <div class="cookie-display">
            <button @click="game.clickCookie(goldenCookie.goldenCookieBonus.value)" class="cookie-button">
              <pre class="ascii-art">
    .-"""""-.
  .'  o   o  '.
 / o       o   \
|    o  o       |
|  o     o   o  |
 \  o       o  /
  '.  o   o .'
    '-.....-'
              </pre>
            </button>
            <div v-if="goldenCookie.goldenCookieBonusTimeRemaining.value > 0" class="bonus-indicator">
              {{ goldenCookie.goldenCookieBonus.value }}x bonus ({{ goldenCookie.goldenCookieBonusTimeRemaining.value }}s)
            </div>
          </div>
          <div class="click-stats">
            <p>Total Clicks: {{ formatNumber(game.totalClicks.value) }}</p>
            <p>Lifetime Cookies: {{ formatNumber(game.totalCookiesEarned.value) }}</p>
            <p>Click Power: {{ game.clickPower.value.toFixed(1) }}</p>
            <p>Golden Cookies: {{ game.goldenCookiesCollected.value }}</p>
          </div>
          <div class="game-controls">
            <button @click="saveGame" class="control-btn">Save Game</button>
            <button @click="handleReset" class="control-btn reset-btn">Reset</button>
          </div>
        </section>

        <!-- Right Column: Shop & Achievements -->
        <section class="sidebar">
          <div class="tabs">
            <button class="tab-btn active">Upgrades</button>
          </div>

          <div class="shop-list">
            <div
              v-for="upgrade in UPGRADES"
              :key="upgrade.id"
              class="upgrade-card"
              :class="{
                'can-afford':
                  game.cookieCount.value >=
                  calculateUpgradeCost(upgrade.baseCost, game.upgrades[upgrade.id]),
              }"
              @click="game.buyUpgrade(upgrade)"
            >
            <div
              v-for="upgrade in UPGRADES"
              :key="upgrade.id"
              class="upgrade-card"
              :class="{
                'can-afford':
                  game.cookieCount.value >=
                  calculateUpgradeCost(upgrade.baseCost, game.upgrades[upgrade.id]),
              }"
              @click="game.buyUpgrade(upgrade)"
            >
              <div class="upgrade-icon">{{ upgrade.icon }}</div>
              <div class="upgrade-info">
                <div class="upgrade-name">
                  {{ upgrade.name }} ({{ game.upgrades[upgrade.id] || 0 }})
                </div>
                <div class="upgrade-cost">
                  Cost:
                  {{
                    formatNumber(
                      calculateUpgradeCost(upgrade.baseCost, game.upgrades[upgrade.id])
                    )
                  }}
                </div>
                <div class="upgrade-desc">{{ upgrade.description }}</div>
              </div>
            </div>
          </div>

          <div class="achievements-section">
            <h3>Achievements</h3>
            <div class="achievements-grid">
              <div
                v-for="achievement in ACHIEVEMENTS"
                :key="achievement.id"
                class="achievement-icon"
                :class="{
                  unlocked: game.unlockedAchievementIds.value.has(achievement.id),
                }"
                :title="achievement.name + ': ' + achievement.description"
              >
              <div
                v-for="achievement in ACHIEVEMENTS"
                :key="achievement.id"
                class="achievement-icon"
                :class="{
                  unlocked: game.unlockedAchievementIds.value.has(achievement.id),
                }"
                :title="achievement.name + ': ' + achievement.description"
              >
                {{ achievement.icon }}
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Golden Cookie -->
      <div
        v-if="goldenCookie.isGoldenCookieActive.value"
        @click="handleGoldenCookieClick"
        class="golden-cookie"
        :style="{
          left: goldenCookie.goldenCookiePosition.value.x + '%',
          top: goldenCookie.goldenCookiePosition.value.y + '%',
        }"
      >
        <pre class="golden-cookie-art">
   _..._
 .'     '.
|  * *   |
|   *    |
 '._*_.'
        </pre>
      </div>

      <!-- Achievement Toast Notifications -->
      <TransitionGroup name="toast" tag="div" class="toast-container">
        <div
          v-for="toast in game.newlyUnlockedAchievements.value"
          :key="toast.id"
          class="toast"
        >
        <div
          v-for="toast in game.newlyUnlockedAchievements.value"
          :key="toast.id"
          class="toast"
        >
          <span class="toast-icon">{{ toast.icon }}</span>
          <div class="toast-content">
            <div class="toast-title">Achievement</div>
            <div class="toast-name">{{ toast.name }}</div>
          </div>
          <button @click="game.clearNewlyUnlockedAchievements" class="toast-close">
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>

    <SausageSite v-else-if="currentPage === 'sausages'" />
  </div>
</template>

<style>
/* =============================================
   App Styles — Minimalist Design
   ============================================= */

/* Navigation — clean, consistent, no decorative emojis */
.main-nav {
  display: flex;
  justify-content: center;
  background: var(--color-surface);
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.main-nav button {
  background: none;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.main-nav button:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}

.main-nav button.active {
  color: var(--color-accent);
  background: var(--color-surface-alt);
  border-color: var(--color-border);
}

/* Game container — generous whitespace */
.game-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 52px);
}

/* Header — functional hierarchy */
.game-header {
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
  margin-bottom: 2.5rem;
}

.main-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-item .value {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Layout — two-column grid */
.game-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  flex: 1;
  overflow: hidden;
}

/* Click section — centered, spacious */
.click-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.cookie-button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: transform 0.08s ease, border-color 0.15s ease;
  user-select: none;
}

.cookie-button:hover {
  border-color: var(--color-accent);
}

.cookie-button:active {
  transform: scale(0.92);
}

.click-stats {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 2;
}

.game-controls {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.control-btn:hover {
  background: var(--color-border);
}

.reset-btn {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.reset-btn:hover {
  background: var(--color-danger-hover);
}

/* Sidebar — clean surface */
.sidebar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tabs {
  margin-bottom: 1rem;
}

.tab-btn {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  padding: 0.4rem 0;
  border-bottom: 2px solid var(--color-accent);
  cursor: default;
}

/* Shop list — consistent card style */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.upgrade-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-surface-alt);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: not-allowed;
  opacity: 0.45;
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.upgrade-card.can-afford {
  cursor: pointer;
  opacity: 1;
  border-color: var(--color-border);
}

.upgrade-card.can-afford:hover {
  border-color: var(--color-accent);
}

.upgrade-icon {
  font-size: 1.6rem;
  width: 2.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-info {
  flex: 1;
  min-width: 0;
}

.upgrade-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.upgrade-cost {
  font-size: 0.8rem;
  color: var(--color-highlight);
  margin-top: 0.15rem;
}

.upgrade-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

/* Achievements — minimal grid */
.achievements-section h3 {
  margin: 0 0 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
  gap: 0.4rem;
}

.achievement-icon {
  font-size: 1.3rem;
  background: var(--color-bg);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid transparent;
  filter: grayscale(1) opacity(0.25);
}

.achievement-icon.unlocked {
  filter: none;
  background: var(--color-surface-alt);
  border-color: var(--color-accent);
}

/* Toast notifications — subtle, clean */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  min-width: 220px;
}

.toast-icon {
  font-size: 1.3rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.toast-title {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toast-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 0.25rem;
}

.toast-close:hover {
  color: var(--color-text-primary);
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Golden Cookie */
.golden-cookie {
  position: fixed;
  cursor: pointer;
  z-index: 999;
  animation: float 2s ease-in-out infinite;
  transition: transform 0.1s ease;
}

.golden-cookie:hover {
  transform: scale(1.1);
}

.golden-cookie-art {
  color: #ffd700;
  font-size: 1.2rem;
  line-height: 1.2;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Bonus Indicator */
.bonus-indicator {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .game-container {
    padding: 1rem;
  }

  .game-header {
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .main-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item .value {
    font-size: 1.3rem;
  }

  .game-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .sidebar {
    max-height: none;
    order: 2;
  }

  .click-section {
    order: 1;
  }

  .cookie-button {
    padding: 1rem 1.5rem;
  }

  .ascii-art {
    font-size: 0.85rem;
  }

  .click-stats {
    font-size: 0.85rem;
  }

  .game-controls {
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    min-width: 120px;
  }

  .achievements-grid {
    grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  }

  .achievement-icon {
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
  }

  .toast-container {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast {
    min-width: unset;
  }

  .golden-cookie-art {
    font-size: 1rem;
  }

  .main-nav {
    padding: 0.5rem;
  }

  .main-nav button {
    font-size: 0.85rem;
    padding: 0.4rem 1rem;
  }
}

@media (max-width: 480px) {
  .game-header h1 {
    font-size: 1.5rem;
  }

  .stat-item .label {
    font-size: 0.7rem;
  }

  .stat-item .value {
    font-size: 1.1rem;
  }

  .cookie-button {
    padding: 0.8rem 1.2rem;
  }

  .ascii-art {
    font-size: 0.7rem;
  }

  .upgrade-card {
    padding: 0.6rem;
  }

  .upgrade-icon {
    font-size: 1.3rem;
    width: 2rem;
  }

  .upgrade-name {
    font-size: 0.85rem;
  }

  .upgrade-cost,
  .upgrade-desc {
    font-size: 0.7rem;
  }

  .bonus-indicator {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
