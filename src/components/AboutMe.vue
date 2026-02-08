<template>
  <div class="about-container">
    <header class="about-header">
      <h1>About Me</h1>
    </header>
    
    <main class="about-content">
      <section class="about-section">
        <h2>Who I Am</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </section>

      <section class="about-section">
        <h2>My Journey</h2>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
          architecto beatae vitae dicta sunt explicabo.
        </p>
        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia 
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro 
          quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
        </p>
      </section>

      <section class="about-section">
        <h2>What I Do</h2>
        <p>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium 
          voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint 
          occaecati cupiditate non provident.
        </p>
        <p>
          Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum 
          fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, 
          cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.about-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.about-header h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin: 0;
}

.about-content {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 2rem;
}

.about-section {
  margin-bottom: 2rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-section h2 {
  color: var(--primary-color);
  font-size: 1.8rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.about-section p {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.about-section p:last-child {
  margin-bottom: 0;
}
</style>
