<script setup>
import { onMounted, watch, ref } from "vue";
import { useGameState } from "../composables/useGameState";
import { UPGRADES, calculateUpgradeCost } from "../utils/upgradeConfig";
import { ACHIEVEMENTS, checkAchievements } from "../utils/achievementConfig";

// Load initial state from localStorage
const SAVE_KEY = "cookie_clicker_save";
const savedData = localStorage.getItem(SAVE_KEY);
const initialState = savedData ? JSON.parse(savedData) : null;

const game = useGameState(initialState);

// Start game on mount
onMounted(() => {
  game.startGame();

  // Auto-save every 30 seconds
  setInterval(() => {
    saveGame();
  }, 30000);
});

// Check for achievements whenever game state changes
watch(
  [game.totalClicks, game.totalCookiesEarned, game.cookiesPerSecond, game.upgrades],
  () => {
    const newlyUnlocked = checkAchievements(
      {
        totalClicks: game.totalClicks.value,
        totalCookiesEarned: game.totalCookiesEarned.value,
        cookiesPerSecond: game.cookiesPerSecond.value,
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

// Formatting helpers
const formatNumber = (num) => Math.floor(num).toLocaleString();
const formatCPS = (num) => num.toFixed(1);
</script>

<template>
  <div class="game-container">
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
          <button @click="game.clickCookie" class="cookie-button">🍪</button>
        </div>
        <div class="click-stats">
          <p>Total Clicks: {{ formatNumber(game.totalClicks.value) }}</p>
          <p>Lifetime Cookies: {{ formatNumber(game.totalCookiesEarned.value) }}</p>
          <p>Click Power: {{ game.clickPower.value.toFixed(1) }}</p>
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
          <div v-for="upgrade in UPGRADES" :key="upgrade.id" class="upgrade-card" :class="{
            'can-afford':
              game.cookieCount.value >=
              calculateUpgradeCost(upgrade.baseCost, game.upgrades[upgrade.id]),
          }" @click="game.buyUpgrade(upgrade)">
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
            <div v-for="achievement in ACHIEVEMENTS" :key="achievement.id" class="achievement-icon"
              :class="{ unlocked: game.unlockedAchievementIds.value.has(achievement.id) }"
              :title="achievement.name + ': ' + achievement.description">
              {{ achievement.icon }}
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Achievement Toast Notifications -->
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div v-for="toast in game.newlyUnlockedAchievements.value" :key="toast.id" class="toast">
        <span class="toast-icon">{{ toast.icon }}</span>
        <div class="toast-content">
          <div class="toast-title">Achievement Unlocked!</div>
          <div class="toast-name">{{ toast.name }}</div>
        </div>
        <button @click="game.clearNewlyUnlockedAchievements" class="toast-close">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Global resets and layout */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.game-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.main-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 0.9rem;
  color: #888;
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  flex: 1;
  overflow: hidden;
}

/* Clicking area */
.click-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cookie-button {
  font-size: 10rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  user-select: none;
}

.cookie-button:active {
  transform: scale(0.95);
}

.click-stats {
  margin-top: 2rem;
  text-align: center;
  line-height: 1.8;
}

.game-controls {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #444;
  color: white;
  cursor: pointer;
}

.reset-btn {
  background: #833;
}

/* Sidebar */
.sidebar {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.upgrade-card {
  display: flex;
  padding: 0.8rem;
  background: #333;
  border-radius: 6px;
  cursor: not-allowed;
  opacity: 0.6;
  transition: all 0.2s;
}

.upgrade-card.can-afford {
  cursor: pointer;
  opacity: 1;
}

.upgrade-card.can-afford:hover {
  background: #3a3a3a;
  transform: translateX(-5px);
}

.upgrade-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
}

.upgrade-name {
  font-weight: bold;
  color: var(--primary-color);
}

.upgrade-cost {
  font-size: 0.9rem;
  color: #ffd700;
}

.upgrade-desc {
  font-size: 0.8rem;
  color: #aaa;
}

/* Achievements */
.achievements-section h3 {
  margin-bottom: 1rem;
  border-top: 1px solid #444;
  padding-top: 1rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
}

.achievement-icon {
  font-size: 1.5rem;
  background: #222;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  filter: grayscale(1) opacity(0.3);
}

.achievement-icon.unlocked {
  filter: none;
  background: #333;
  border: 1px solid var(--primary-color);
}

/* Toasts */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background: #333;
  border-left: 4px solid var(--primary-color);
  padding: 12px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 250px;
}

.toast-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.toast-title {
  font-size: 0.8rem;
  color: #888;
}

.toast-name {
  font-weight: bold;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
