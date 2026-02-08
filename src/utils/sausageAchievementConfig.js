// Achievement configuration for the sausage clicker game
export const SAUSAGE_ACHIEVEMENTS = [
  {
    id: "first_sausage",
    name: "First Link",
    description: "Click the sausage once",
    icon: "[!]",
    check: (state) => state.totalClicks >= 1,
  },
  {
    id: "sausage_rookie",
    name: "Sausage Rookie",
    description: "Click the sausage 100 times",
    icon: "[#]",
    check: (state) => state.totalClicks >= 100,
  },
  {
    id: "wurst_master",
    name: "Wurst Master",
    description: "Click the sausage 1,000 times",
    icon: "[*]",
    check: (state) => state.totalClicks >= 1000,
  },
  {
    id: "sausage_collector",
    name: "Sausage Collector",
    description: "Earn 1,000 progress in sausages",
    icon: "(s)",
    check: (state) => state.totalSausagesEarned >= 1000,
  },
  {
    id: "sausage_king",
    name: "Sausage King",
    description: "Reach 100 sausages per second",
    icon: "^^^",
    check: (state) => state.sausagesPerSecond >= 100,
  },
];

// Helper function to calculate total upgrades owned
function getTotalUpgrades(upgrades) {
  if (!upgrades) return 0;
  return Object.values(upgrades).reduce((sum, count) => sum + count, 0);
}

// Check which achievements should be unlocked based on current state
export function checkSausageAchievements(state, unlockedIds) {
  const newlyUnlocked = [];

  for (const achievement of SAUSAGE_ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.check(state)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
