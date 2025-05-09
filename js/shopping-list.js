import { auth, db } from '../firebase-config.js';
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { showToast } from './utils.js';

// DOM Elements
const shoppingList = document.getElementById('shoppingList');
const clearListBtn = document.getElementById('clearListBtn');
const printListBtn = document.getElementById('printListBtn');

// Load shopping list
auth.onAuthStateChanged((user) => {
  if (user) {
    loadShoppingList(user.uid);
  } else {
    location.href = 'auth.html';
  }
});

function loadShoppingList(uid) {
  const shoppingListRef = ref(db, `shoppingList/${uid}`);
  
  onValue(shoppingListRef, (snapshot) => {
    shoppingList.innerHTML = '';
    
    if (!snapshot.exists()) {
      shoppingList.innerHTML = '<p class="no-items">Your shopping list is empty</p>';
      return;
    }
    
    snapshot.forEach((itemSnapshot) => {
      const item = itemSnapshot.val();
      const li = document.createElement('li');
      li.className = 'shopping-item';
      li.innerHTML = `
        <label>
          <input type="checkbox">
          <span>${item.ingredient}</span>
        </label>
        <button class="btn-icon small" onclick="removeItem('${itemSnapshot.key}')">
          <i class="fas fa-times"></i>
        </button>
      `;
      shoppingList.appendChild(li);
    });
  });
}

// Clear shopping list
clearListBtn.addEventListener('click', () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  if (confirm('Are you sure you want to clear your entire shopping list?')) {
    const shoppingListRef = ref(db, `shoppingList/${uid}`);
    remove(shoppingListRef)
      .then(() => showToast('Shopping list cleared'))
      .catch(() => showToast('Failed to clear list', 'error'));
  }
});

// Print shopping list
printListBtn.addEventListener('click', () => {
  window.print();
});

// Global function to remove an item
window.removeItem = (itemId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const itemRef = ref(db, `shoppingList/${uid}/${itemId}`);
  remove(itemRef)
    .then(() => showToast('Item removed'))
    .catch(() => showToast('Failed to remove item', 'error'));
};

// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeStyles = document.getElementById('darkModeStyles');

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  darkModeStyles.disabled = false;
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  darkModeStyles.disabled = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  
  // Update icon
  darkModeToggle.innerHTML = isDarkMode 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
});