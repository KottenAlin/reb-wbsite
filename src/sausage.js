// Sausage Site JavaScript

// Initialize counter
let sausageCount = 0;

// Load saved count from localStorage
const SAVE_KEY = 'sausage_counter';
const savedCount = localStorage.getItem(SAVE_KEY);
if (savedCount) {
  sausageCount = parseInt(savedCount, 10);
  updateCounterDisplay();
}

// Get elements
const sausageButton = document.getElementById('sausageButton');
const sausageCountDisplay = document.getElementById('sausageCount');

// Add click event listener
sausageButton.addEventListener('click', () => {
  sausageCount++;
  updateCounterDisplay();
  saveCount();
  
  // Add a little animation
  sausageButton.style.transform = 'scale(0.9)';
  setTimeout(() => {
    sausageButton.style.transform = 'scale(1)';
  }, 100);
});

// Update counter display
function updateCounterDisplay() {
  sausageCountDisplay.textContent = sausageCount.toLocaleString();
}

// Save count to localStorage
function saveCount() {
  localStorage.setItem(SAVE_KEY, sausageCount.toString());
}

// Add some interactivity to gallery items
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    // Cycle through different sausage emojis
    const sausageEmojis = ['🌭', '🥓', '🍖', '🌮', '🥪', '🍕'];
    item.textContent = sausageEmojis[Math.floor(Math.random() * sausageEmojis.length)];
  });
});

// Add a welcome message
console.log('🌭 Welcome to Sausage Central! 🌭');
console.log('Click the sausage to increase your counter!');
