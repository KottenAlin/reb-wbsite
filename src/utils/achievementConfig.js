// Achievement configuration for the cookie clicker game
export const ACHIEVEMENTS = [
  {
    id: "first_click",
    name: "First Steps",
    description: "Click the cookie once",
    icon: "[!]",
    check: (state) => state.totalClicks >= 1,
  },
  {
    id: "cookie_rookie",
    name: "Cookie Rookie",
    description: "Click the cookie 100 times",
    icon: "[1]",
    check: (state) => state.totalClicks >= 100,
  },
  {
    id: "click_master",
    name: "Click Master",
    description: "Click the cookie 1,000 times",
    icon: "[*]",
    check: (state) => state.totalClicks >= 1000,
  },
  {
    id: "cookie_collector",
    name: "Cookie Collector",
    description: "Earn 1,000 total cookies",
    icon: "(o)",
    check: (state) => state.totalCookiesEarned >= 1000,
  },
  {
    id: "wealthy_baker",
    name: "Wealthy Baker",
    description: "Earn 1,000,000 total cookies",
    icon: "[$]",
    check: (state) => state.totalCookiesEarned >= 1000000,
  },
  {
    id: "cookie_billionaire",
    name: "Cookie Billionaire",
    description: "Earn 1,000,000,000 total cookies",
    icon: "<>",
    check: (state) => state.totalCookiesEarned >= 1000000000,
  },
  {
    id: "upgrade_beginner",
    name: "Upgrade Beginner",
    description: "Buy your first upgrade",
    icon: "[+]",
    check: (state) => getTotalUpgrades(state.upgrades) >= 1,
  },
  {
    id: "upgrade_master",
    name: "Upgrade Master",
    description: "Own 50 total upgrades",
    icon: "{+}",
    check: (state) => getTotalUpgrades(state.upgrades) >= 50,
  },
  {
    id: "production_power",
    name: "Production Power",
    description: "Reach 10 cookies per second",
    icon: ">>",
    check: (state) => state.cookiesPerSecond >= 10,
  },
  {
    id: "cookie_empire",
    name: "Cookie Empire",
    description: "Reach 100 cookies per second",
    icon: "|||",
    check: (state) => state.cookiesPerSecond >= 100,
  },
];

// Helper function to calculate total upgrades owned
function getTotalUpgrades(upgrades) {
  if (!upgrades) return 0;
  return Object.values(upgrades).reduce((sum, count) => sum + count, 0);
}

// Check which achievements should be unlocked based on current state
export function checkAchievements(state, unlockedIds) {
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.check(state)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// Get all achievements with their unlock status
export function getAchievementsWithStatus(unlockedIds) {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id),
  }));
}
