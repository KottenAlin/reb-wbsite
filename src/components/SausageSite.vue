<script setup>
import { onMounted, watch, ref } from "vue";
import { useSausageState } from "../composables/useSausageState";
import {
  SAUSAGE_UPGRADES,
  calculateSausageUpgradeCost,
} from "../utils/sausageUpgradeConfig";
import {
  SAUSAGE_ACHIEVEMENTS,
  checkSausageAchievements,
} from "../utils/sausageAchievementConfig";

const SAVE_KEY = "sausage_clicker_save";
const savedData = localStorage.getItem(SAVE_KEY);
const initialState = savedData ? JSON.parse(savedData) : null;

const game = useSausageState(initialState);

onMounted(() => {
  game.startAutoClicker();
  setInterval(() => {
    saveGame();
  }, 30000);
});

watch(
  [game.totalClicks, game.totalSausagesEarned, game.sausagesPerSecond, game.upgrades],
  () => {
    const newlyUnlocked = checkSausageAchievements(
      {
        totalClicks: game.totalClicks.value,
        totalSausagesEarned: game.totalSausagesEarned.value,
        sausagesPerSecond: game.sausagesPerSecond.value,
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
}

function handleReset() {
  if (confirm("Are you sure you want to reset all sausage progress?")) {
    game.resetGame();
    localStorage.removeItem(SAVE_KEY);
  }
}

const formatNumber = (num) => Math.floor(num).toLocaleString();
const formatSPS = (num) => num.toFixed(1);
</script>

<template>
  <div class="sausage-site">
    <header class="sausage-header">
      <h1>The Sausage Sanctuary</h1>
      <p class="tagline">Dedicated to just sausages.</p>
      <div class="main-stats">
        <div class="stat-item">
          <span class="label">Sausages:</span>
          <span class="value">{{ formatNumber(game.sausageCount.value) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">per second:</span>
          <span class="value">{{ formatSPS(game.sausagesPerSecond.value) }}</span>
        </div>
      </div>
    </header>

    <main class="game-layout">
      <section class="click-section">
        <div class="sausage-display">
          <button @click="game.clickSausage" class="sausage-button">
            <pre class="ascii-art">
  _________
 /         \
|  |||||||  |
|  |||||||  |
 \_________/
  \|||||||/
   |||||||
   '-----'
            </pre>
          </button>
        </div>
        <div class="click-stats">
          <p>Total Clicks: {{ formatNumber(game.totalClicks.value) }}</p>
          <p>Lifetime Sausages: {{ formatNumber(game.totalSausagesEarned.value) }}</p>
          <p>Grilling Power: {{ game.clickPower.value.toFixed(1) }}</p>
        </div>
        <div class="game-controls">
          <button @click="saveGame" class="control-btn">Save Progress</button>
          <button @click="handleReset" class="control-btn reset-btn">Reset</button>
        </div>
      </section>

      <section class="sidebar">
        <div class="tabs">
          <button class="tab-btn active">Meat Upgrades</button>
        </div>

        <div class="shop-list">
          <div
            v-for="upgrade in SAUSAGE_UPGRADES"
            :key="upgrade.id"
            class="upgrade-card"
            :class="{
              'can-afford':
                game.sausageCount.value >=
                calculateSausageUpgradeCost(upgrade.baseCost, game.upgrades[upgrade.id]),
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
                    calculateSausageUpgradeCost(
                      upgrade.baseCost,
                      game.upgrades[upgrade.id]
                    )
                  )
                }}
              </div>
              <div class="upgrade-desc">{{ upgrade.description }}</div>
            </div>
          </div>
        </div>

        <div class="achievements-section">
          <h3>Sausage Achievements</h3>
          <div class="achievements-grid">
            <div
              v-for="achievement in SAUSAGE_ACHIEVEMENTS"
              :key="achievement.id"
              class="achievement-icon"
              :class="{ unlocked: game.unlockedAchievementIds.value.has(achievement.id) }"
              :title="achievement.name + ': ' + achievement.description"
            >
              {{ achievement.icon }}
            </div>
          </div>
        </div>
      </section>
    </main>

    <TransitionGroup name="toast" tag="div" class="toast-container">
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
</template>

<style scoped>
/* Sausage page — consistent with global minimal design */
.sausage-site {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 52px);
}

.sausage-header {
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
  margin-bottom: 2.5rem;
}

.tagline {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.sausage-button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: transform 0.08s ease, border-color 0.15s ease;
  user-select: none;
}

.sausage-button:hover {
  border-color: var(--color-accent);
}

.sausage-button:active {
  transform: scale(0.92);
}

.upgrade-card.can-afford {
  border-color: var(--color-accent);
}

.sidebar {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.control-btn {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
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
</style>
