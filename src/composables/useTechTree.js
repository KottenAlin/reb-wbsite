// Tech tree composable for cookie clicker
import { ref, computed, reactive } from "vue";
import { 
  TECH_TREE, 
  calculateTechPoints, 
  getAvailableTechs,
  getTechsByCategory,
  TECH_CATEGORIES
} from "../utils/techTreeConfig.js";

export function useTechTree(gameState) {
  // Researched technologies (Set of tech IDs)
  const researchedTechs = reactive(new Set(gameState.researchedTechs ?? []));
  
  // Tech points spent
  const techPointsSpent = ref(gameState.techPointsSpent ?? 0);
  
  // Calculate total tech points earned
  const totalTechPoints = computed(() => {
    return calculateTechPoints(gameState.totalCookiesEarned.value);
  });
  
  // Calculate available tech points
  const availableTechPoints = computed(() => {
    return totalTechPoints.value - techPointsSpent.value;
  });
  
  // Get all available techs with status
  const availableTechs = computed(() => {
    return getAvailableTechs(researchedTechs, {
      totalCookiesEarned: gameState.totalCookiesEarned.value,
      prestigeLevel: gameState.prestigeLevel?.value ?? 0,
    });
  });
  
  // Get techs by category
  const techsByCategory = computed(() => {
    const categories = {};
    
    Object.values(TECH_CATEGORIES).forEach(category => {
      categories[category] = getTechsByCategory(category, researchedTechs, {
        totalCookiesEarned: gameState.totalCookiesEarned.value,
        prestigeLevel: gameState.prestigeLevel?.value ?? 0,
      });
    });
    
    return categories;
  });
  
  // Research statistics
  const researchStats = computed(() => {
    const total = TECH_TREE.length;
    const researched = researchedTechs.size;
    const unlocked = availableTechs.value.filter(tech => tech.unlocked).length;
    const canResearch = availableTechs.value.filter(tech => 
      tech.canResearch && availableTechPoints.value >= tech.cost
    ).length;
    
    return {
      total,
      researched,
      unlocked,
      canResearch,
      percentage: total > 0 ? Math.round((researched / total) * 100) : 0,
    };
  });
  
  // Check if a tech can be researched
  function canResearch(tech) {
    // Already researched
    if (researchedTechs.has(tech.id)) return false;
    
    // Not enough points
    if (availableTechPoints.value < tech.cost) return false;
    
    // Check unlock condition
    if (tech.unlockCondition) {
      const unlocked = tech.unlockCondition({
        totalCookiesEarned: gameState.totalCookiesEarned.value,
        prestigeLevel: gameState.prestigeLevel?.value ?? 0,
      });
      if (!unlocked) return false;
    }
    
    // Check prerequisites
    if (tech.prerequisites && tech.prerequisites.length > 0) {
      const prerequisitesMet = tech.prerequisites.every(prereq => 
        researchedTechs.has(prereq)
      );
      if (!prerequisitesMet) return false;
    }
    
    return true;
  }
  
  // Research a technology
  function researchTech(tech) {
    if (!canResearch(tech)) {
      return false;
    }
    
    techPointsSpent.value += tech.cost;
    researchedTechs.add(tech.id);
    
    return true;
  }
  
  // Check if a tech is researched
  function isTechResearched(techId) {
    return researchedTechs.has(techId);
  }
  
  // Get serializable state
  function getSerializableState() {
    return {
      researchedTechs: Array.from(researchedTechs),
      techPointsSpent: techPointsSpent.value,
    };
  }
  
  // Load state
  function loadState(state) {
    if (state.researchedTechs) {
      researchedTechs.clear();
      state.researchedTechs.forEach(techId => researchedTechs.add(techId));
    }
    if (state.techPointsSpent !== undefined) {
      techPointsSpent.value = state.techPointsSpent;
    }
  }
  
  return {
    // State
    researchedTechs,
    techPointsSpent,
    totalTechPoints,
    availableTechPoints,
    availableTechs,
    techsByCategory,
    researchStats,
    
    // Methods
    canResearch,
    researchTech,
    isTechResearched,
    getSerializableState,
    loadState,
  };
}
