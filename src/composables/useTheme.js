import { computed, ref } from "vue";

const THEME_KEY = "site_theme";
const theme = ref("dark");

function applyTheme(nextTheme) {
  document.documentElement.setAttribute("data-theme", nextTheme);
}

export function useTheme() {
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    theme.value = savedTheme === "light" ? "light" : "dark";
    applyTheme(theme.value);
  }

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, theme.value);
    applyTheme(theme.value);
  }

  return {
    isDarkTheme: computed(() => theme.value === "dark"),
    initTheme,
    toggleTheme,
  };
}
