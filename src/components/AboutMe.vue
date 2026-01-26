<template>
  <div class="about-me">
    <h2>About Me</h2>
    <div class="profile">
      <div class="avatar" role="img" aria-label="User avatar">👤</div>
      <div class="info">
        <h3>Welcome to my page!</h3>
        <p>
          Hi! I'm a web developer passionate about creating beautiful and functional websites.
          This is a simple about me page where you can learn more about who I am and what I do.
        </p>
        <p>
          I enjoy working with modern web technologies like Vue.js, React, and building 
          responsive user interfaces that provide great user experiences.
        </p>
      </div>
    </div>
    
    <div class="interests">
      <h3>My Interests</h3>
      <ul>
        <li>Web Development</li>
        <li>UI/UX Design</li>
        <li>Open Source</li>
        <li>Learning new technologies</li>
      </ul>
    </div>

    <div class="contact">
      <h3>Get in Touch</h3>
      <p>Feel free to reach out if you'd like to connect!</p>
    </div>
  </div>
</template>

<style scoped>
.about-me {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: #42b883;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.profile {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 12px;
  align-items: center;
}

.avatar {
  font-size: 5rem;
  min-width: 100px;
  text-align: center;
}

.info h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
}

.info p {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.interests {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(66, 184, 131, 0.05);
  border-radius: 8px;
}

.interests h3 {
  color: #42b883;
  margin-top: 0;
  margin-bottom: 1rem;
}

.interests ul {
  list-style: none;
  padding: 0;
}

.interests li {
  color: #2c3e50;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.interests li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #42b883;
  font-weight: bold;
}

.contact {
  text-align: center;
  padding: 2rem;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 8px;
}

.contact h3 {
  color: #42b883;
  margin-top: 0;
  margin-bottom: 1rem;
}

.contact p {
  color: #2c3e50;
  margin: 0;
}

@media (max-width: 640px) {
  .profile {
    flex-direction: column;
    text-align: center;
  }
  
  .about-me {
    padding: 1rem;
  }
}
</style>
