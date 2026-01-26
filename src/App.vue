<script setup>
import AboutMe from './components/AboutMe.vue'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>My Website</h1>
      <p class="tagline">Welcome to my personal space on the web</p>
    </header>
    
    <main>
      <AboutMe />
    </main>
    
    <footer>
      <p>&copy; 2026 My Website. Built with Vue & Vite.</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.tagline {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

main {
  flex: 1;
  padding: 2rem 1rem;
}

footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
}

footer p {
  margin: 0;
  opacity: 0.8;
}
</style>