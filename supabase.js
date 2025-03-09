// Global variables
var playCount = 0;
var countInitialized = false;

// Function to update the counter display
function updatePlayCountDisplay() {
  var countElement = document.getElementById('play-count');
  if (countElement) {
    countElement.textContent = countInitialized ? playCount.toString() : 'many';
  }
}

// Function to increment the play count
function incrementPlayCount() {
  playCount++;
  updatePlayCountDisplay();
  console.log('Play count incremented to: ' + playCount);
  return playCount;
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing counter...');
  
  // Set a default value
  playCount = 42;
  countInitialized = true;
  
  // Update the display
  updatePlayCountDisplay();
  
  console.log('Counter initialized with value: ' + playCount);
}); 