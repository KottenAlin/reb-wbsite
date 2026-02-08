<script setup>
</script>

<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">About Me</router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<style>
/* Global resets and layout */
:root {
  --primary-color: #42b883;
  --bg-color: #1a1a1a;
  --card-bg: #2a2a2a;
  --text-color: #e0e0e0;
}

body {
  margin: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
}

.main-nav {
  background-color: var(--card-bg);
  border-bottom: 2px solid #333;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #333;
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  background-color: #333;
}
</style>