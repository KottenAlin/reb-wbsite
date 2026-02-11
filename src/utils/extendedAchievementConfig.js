// Extended achievement configuration for the cookie clicker game
// These achievements extend the base ACHIEVEMENTS with more advanced goals

// Helper function to calculate total upgrades owned
function getTotalUpgrades(upgrades) {
  if (!upgrades) return 0;
  return Object.values(upgrades).reduce((sum, count) => sum + count, 0);
}

// Helper function to check if player has only cursors
function hasOnlyCursors(upgrades) {
  if (!upgrades) return false;
  const { cursor, ...otherUpgrades } = upgrades;
  return cursor > 0 && Object.values(otherUpgrades).every(count => count === 0);
}

// Helper function to check if player has all upgrade types
function hasAllUpgradeTypes(upgrades) {
  if (!upgrades) return false;
  const requiredTypes = ['cursor', 'grandma', 'farm', 'mine', 'factory', 'bank', 'temple', 'wizard_tower'];
  return requiredTypes.every(type => (upgrades[type] || 0) >= 1);
}

export const EXTENDED_ACHIEVEMENTS = [
  // Production Achievements (High CPS milestones)
  {
    id: "cookie_mega_factory",
    name: "Cookie Mega Factory",
    description: "Reach 100,000 cookies per second",
    icon: "[M]",
    category: "production",
    check: (state) => state.cookiesPerSecond >= 100000,
  },
  {
    id: "cookie_galaxy",
    name: "Cookie Galaxy",
    description: "Reach 1,000,000 cookies per second",
    icon: "[*]",
    category: "production",
    check: (state) => state.cookiesPerSecond >= 1000000,
  },
  {
    id: "cookie_universe",
    name: "Cookie Universe",
    description: "Reach 10,000,000 cookies per second",
    icon: "<*>",
    category: "production",
    check: (state) => state.cookiesPerSecond >= 10000000,
  },
  {
    id: "infinite_cookies",
    name: "Infinite Cookies",
    description: "Reach 100,000,000 cookies per second",
    icon: "{*}",
    category: "production",
    check: (state) => state.cookiesPerSecond >= 100000000,
  },

  // Collection Achievements (Total cookies earned)
  {
    id: "cookie_trillionaire",
    name: "Cookie Trillionaire",
    description: "Earn 1,000,000,000,000 total cookies",
    icon: "[T]",
    category: "collection",
    check: (state) => state.totalCookiesEarned >= 1000000000000,
  },
  {
    id: "cookie_quadrillionaire",
    name: "Cookie Quadrillionaire",
    description: "Earn 1,000,000,000,000,000 total cookies",
    icon: "[Q]",
    category: "collection",
    check: (state) => state.totalCookiesEarned >= 1000000000000000,
  },

  // Time-based Achievements
  {
    id: "ancient_baker",
    name: "Ancient Baker",
    description: "Play for 1 hour (3,600 seconds)",
    icon: "[1h]",
    category: "time",
    check: (state) => state.playTime >= 3600,
  },
  {
    id: "dedicated_baker",
    name: "Dedicated Baker",
    description: "Play for 10 hours (36,000 seconds)",
    icon: "[10h]",
    category: "time",
    check: (state) => state.playTime >= 36000,
  },
  {
    id: "cookie_legend",
    name: "Cookie Legend",
    description: "Play for 100 hours (360,000 seconds)",
    icon: "[100h]",
    category: "time",
    check: (state) => state.playTime >= 360000,
  },

  // Upgrade Achievements (Total upgrades owned)
  {
    id: "upgrade_collector",
    name: "Upgrade Collector",
    description: "Own 100 total upgrades",
    icon: "<+>",
    category: "upgrades",
    check: (state) => getTotalUpgrades(state.upgrades) >= 100,
  },
  {
    id: "upgrade_hoarder",
    name: "Upgrade Hoarder",
    description: "Own 250 total upgrades",
    icon: "<<+>>",
    category: "upgrades",
    check: (state) => getTotalUpgrades(state.upgrades) >= 250,
  },
  {
    id: "upgrade_lord",
    name: "Upgrade Lord",
    description: "Own 500 total upgrades",
    icon: "{++}",
    category: "upgrades",
    check: (state) => getTotalUpgrades(state.upgrades) >= 500,
  },
  {
    id: "max_cursor",
    name: "Cursor Master",
    description: "Own 100 cursors",
    icon: "[>]",
    category: "upgrades",
    check: (state) => (state.upgrades?.cursor || 0) >= 100,
  },
  {
    id: "max_grandma",
    name: "Grandma's Favorite",
    description: "Own 100 grandmas",
    icon: "[&]",
    category: "upgrades",
    check: (state) => (state.upgrades?.grandma || 0) >= 100,
  },
  {
    id: "max_factory",
    name: "Industrial Mogul",
    description: "Own 100 factories",
    icon: "[F]",
    category: "upgrades",
    check: (state) => (state.upgrades?.factory || 0) >= 100,
  },

  // Special Achievements (Unique accomplishments)
  {
    id: "speed_clicker",
    name: "Speed Clicker",
    description: "Click 10 times in 1 second",
    icon: "[!!]",
    category: "special",
    check: (state) => state.speedClickRecord >= 10,
  },
  {
    id: "click_combo",
    name: "Click Combo",
    description: "Click 100 times in 10 seconds",
    icon: "[!!!]",
    category: "special",
    check: (state) => state.clickComboRecord >= 100,
  },
  {
    id: "golden_master",
    name: "Golden Master",
    description: "Collect 100 golden cookies",
    icon: "<GG>",
    category: "special",
    check: (state) => state.goldenCookiesCollected >= 100,
  },
  {
    id: "golden_legend",
    name: "Golden Legend",
    description: "Collect 500 golden cookies",
    icon: "{GG}",
    category: "special",
    check: (state) => state.goldenCookiesCollected >= 500,
  },
  {
    id: "prestigious_baker",
    name: "Prestigious Baker",
    description: "Complete your first prestige",
    icon: "[P]",
    category: "special",
    check: (state) => (state.prestigeLevel || 0) >= 1,
  },
  {
    id: "prestige_master",
    name: "Prestige Master",
    description: "Complete 10 prestiges",
    icon: "<P>",
    category: "special",
    check: (state) => (state.prestigeLevel || 0) >= 10,
  },

  // Secret Achievements (Hidden until unlocked)
  {
    id: "lucky_seven",
    name: "Lucky Seven",
    description: "Have exactly 7,777,777 cookies",
    icon: "[7]",
    category: "secret",
    check: (state) => state.cookieCount === 7777777,
  },
  {
    id: "the_answer",
    name: "The Answer",
    description: "Have exactly 42,000,000 cookies",
    icon: "[42]",
    category: "secret",
    check: (state) => state.cookieCount === 42000000,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Reach 1,000 CPS with only cursors",
    icon: "[>_<]",
    category: "secret",
    check: (state) => state.cookiesPerSecond >= 1000 && hasOnlyCursors(state.upgrades),
  },
  {
    id: "diversified",
    name: "Diversified Portfolio",
    description: "Own at least 1 of every upgrade type",
    icon: "[ALL]",
    category: "secret",
    check: (state) => hasAllUpgradeTypes(state.upgrades),
  },
];

// Achievement categories for filtering
export const ACHIEVEMENT_CATEGORIES = [
  { id: "all", name: "All", icon: "[*]" },
  { id: "production", name: "Production", icon: "[P]" },
  { id: "collection", name: "Collection", icon: "[C]" },
  { id: "time", name: "Time", icon: "[T]" },
  { id: "upgrades", name: "Upgrades", icon: "[U]" },
  { id: "special", name: "Special", icon: "[S]" },
  { id: "secret", name: "Secret", icon: "[?]" },
];

// Get achievements by category
export function getAchievementsByCategory(category, achievements) {
  if (category === "all") {
    return achievements;
  }
  return achievements.filter(achievement => achievement.category === category);
}

// Get achievement stats
export function getAchievementStats(unlockedIds, allAchievements) {
  const total = allAchievements.length;
  const unlocked = Array.from(unlockedIds).filter(id => 
    allAchievements.some(a => a.id === id)
  ).length;
  
  const byCategory = {};
  ACHIEVEMENT_CATEGORIES.forEach(cat => {
    if (cat.id === "all") return;
    const categoryAchievements = getAchievementsByCategory(cat.id, allAchievements);
    const categoryUnlocked = categoryAchievements.filter(a => unlockedIds.has(a.id)).length;
    byCategory[cat.id] = {
      total: categoryAchievements.length,
      unlocked: categoryUnlocked,
      percentage: categoryAchievements.length > 0 
        ? Math.round((categoryUnlocked / categoryAchievements.length) * 100) 
        : 0,
    };
  });
  
  return {
    total,
    unlocked,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    byCategory,
  };
}
