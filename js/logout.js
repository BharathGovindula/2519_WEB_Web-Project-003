import { auth } from '../firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast } from './utils.js';

export const initializeLogout = () => {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      
      // Clear all relevant storage
      localStorage.removeItem('recipeDraft');
      localStorage.removeItem('darkMode');
      localStorage.removeItem('userPreferences');
      
      // Redirect to auth page
      window.location.href = 'auth.html';
    } catch (error) {
      console.error('Logout error:', error);
      showToast(error.message, 'error');
    }
  });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogout);