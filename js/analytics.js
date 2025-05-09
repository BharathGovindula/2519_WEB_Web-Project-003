import { auth, db } from '../firebase-config.js';
import { onValue, ref } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { showToast } from './utils.js';

// DOM Elements
const totalRecipesEl = document.getElementById('totalRecipes');
const totalLikesEl = document.getElementById('totalLikes');
const totalViewsEl = document.getElementById('totalViews');
const topRatedRecipeEl = document.getElementById('topRatedRecipe');

export const loadAnalytics = (userId) => {
  const recipeRef = ref(db, `recipes/${userId}`);
  
  onValue(recipeRef, (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No recipes found', 'info');
      return;
    }
    
    let totalRecipes = 0;
    let totalLikes = 0;
    let totalViews = 0;
    let topRatedRecipe = { rating: 0, name: 'None' };
    
    snapshot.forEach((child) => {
      const recipe = child.val();
      totalRecipes++;
      totalLikes += recipe.likes || 0;
      totalViews += recipe.views || 0;
      
      const rating = recipe.rating || 0;
      if (rating > topRatedRecipe.rating) {
        topRatedRecipe = {
          rating,
          name: recipe.name || 'Unnamed Recipe'
        };
      }
    });
    
    // Update UI
    totalRecipesEl.textContent = totalRecipes;
    totalLikesEl.textContent = totalLikes;
    totalViewsEl.textContent = totalViews;
    topRatedRecipeEl.textContent = topRatedRecipe.name;
  });
};

// Initialize analytics when user is logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    loadAnalytics(user.uid);
  }
});