import { auth } from '../firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast } from './utils.js';

const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const formTitle = document.getElementById('formTitle');
const toggleText = document.getElementById('toggleText');
const submitBtn = document.getElementById('submitBtn');

let isLogin = true;

// Toggle between login and register
function updateFormMode() {
  formTitle.textContent = isLogin ? 'Login' : 'Register';
  submitBtn.textContent = isLogin ? 'Login' : 'Register';
  confirmPasswordGroup.style.display = isLogin ? 'none' : 'block';
  toggleText.innerHTML = isLogin
    ? `Don't have an account? <a href="#" id="toggleLink">Register here</a>`
    : `Already have an account? <a href="#" id="toggleLink">Login here</a>`;
  
  // Update password requirements
  if (!isLogin) {
    passwordInput.placeholder = 'At least 6 characters';
  } else {
    passwordInput.placeholder = '';
  }
}

// Handle form toggle
document.addEventListener('click', (e) => {
  if (e.target.id === 'toggleLink') {
    e.preventDefault();
    isLogin = !isLogin;
    updateFormMode();
  }
});

// Initialize form mode
updateFormMode();

// Form submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput?.value.trim();

  // Validation
  if (!email || !password) {
    return showToast('Please fill in all fields', 'error');
  }

  if (!isLogin && password !== confirmPassword) {
    return showToast('Passwords do not match', 'error');
  }

  if (!isLogin && password.length < 6) {
    return showToast('Password must be at least 6 characters', 'error');
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Login successful!');
      window.location.href = 'index.html';
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      showToast('Account created successfully!');
      isLogin = true;
      updateFormMode();
      authForm.reset();
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? 'Login' : 'Register';
  }
});


// Add this to auth.js (usually at the bottom)
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        // Clear any stored data
        localStorage.removeItem('recipeDraft');
        localStorage.removeItem('darkMode');
        
        // Redirect to auth page
        window.location.href = 'auth.html';
      }).catch((error) => {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
      });
    });
  }
});