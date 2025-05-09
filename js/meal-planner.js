import { auth, db } from '../firebase-config.js';
import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { showToast } from './utils.js';

// DOM Elements
const mealDaySelect = document.getElementById('mealDay');
const mealRecipeSelect = document.getElementById('mealRecipeSelect');
const assignMealBtn = document.getElementById('assignMealBtn');
const generateShoppingListBtn = document.getElementById('generateShoppingListBtn');
const weekPlanner = document.querySelector('.week-planner');

// Initialize meal planner
auth.onAuthStateChanged((user) => {
  if (user) {
    loadRecipes(user.uid);
    loadMealPlan(user.uid);
  } else {
    location.href = 'auth.html';
  }
});

// Load recipes for dropdown
function loadRecipes(uid) {
  const recipeRef = ref(db, `recipes/${uid}`);
  
  onValue(recipeRef, (snapshot) => {
    mealRecipeSelect.innerHTML = '<option value="">Select a Recipe</option>';
    
    snapshot.forEach((child) => {
      const recipe = child.val();
      const option = document.createElement('option');
      option.value = child.key;
      option.textContent = recipe.name;
      mealRecipeSelect.appendChild(option);
    });
  });
}

// Assign meal to day
assignMealBtn.addEventListener('click', () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const day = mealDaySelect.value;
  const recipeId = mealRecipeSelect.value;
  
  if (!recipeId) {
    showToast('Please select a recipe', 'error');
    return;
  }
  
  const mealPlanRef = ref(db, `mealPlans/${uid}/${day}`);
  push(mealPlanRef, { recipeId })
    .then(() => showToast('Meal assigned successfully!'))
    .catch(() => showToast('Failed to assign meal', 'error'));
});

// Load and display meal plan
function loadMealPlan(uid) {
  const mealPlanRef = ref(db, `mealPlans/${uid}`);
  
  onValue(mealPlanRef, (snapshot) => {
    if (!snapshot.exists()) {
      // Clear all days if no meal plan exists
      document.querySelectorAll('.meals-list').forEach(list => {
        list.innerHTML = '<p class="no-meals">No meals planned</p>';
      });
      return;
    }
    
    // Clear existing meals
    document.querySelectorAll('.meals-list').forEach(list => {
      list.innerHTML = '';
    });
    
    // Process each day
    snapshot.forEach((daySnapshot) => {
      const day = daySnapshot.key;
      const dayElement = document.getElementById(day.toLowerCase());
      const mealsList = dayElement?.querySelector('.meals-list');
      
      if (!mealsList) return;
      
      if (daySnapshot.size === 0) {
        mealsList.innerHTML = '<p class="no-meals">No meals planned</p>';
        return;
      }
      
      daySnapshot.forEach((mealSnapshot) => {
        const meal = mealSnapshot.val();
        getRecipeDetails(uid, meal.recipeId)
          .then(recipe => {
            const mealElement = document.createElement('div');
            mealElement.className = 'meal-item';
            mealElement.innerHTML = `
              <h4>${recipe.name}</h4>
              <p class="meal-category">${recipe.category}</p>
              <button class="btn-icon small" onclick="removeMeal('${day}', '${mealSnapshot.key}')">
                <i class="fas fa-times"></i>
              </button>
            `;
            mealsList.appendChild(mealElement);
          });
      });
    });
  });
}

// Get recipe details by ID
async function getRecipeDetails(uid, recipeId) {
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  
  return new Promise((resolve) => {
    onValue(recipeRef, (snapshot) => {
      resolve(snapshot.val());
    }, { onlyOnce: true });
  });
}

// Generate shopping list from meal plan
generateShoppingListBtn.addEventListener('click', () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const mealPlanRef = ref(db, `mealPlans/${uid}`);
  const shoppingListRef = ref(db, `shoppingList/${uid}`);
  
  onValue(mealPlanRef, async (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No meals planned for the week', 'info');
      return;
    }
    
    // Collect all recipe IDs from meal plan
    const recipePromises = [];
    
    snapshot.forEach((daySnapshot) => {
      daySnapshot.forEach((mealSnapshot) => {
        const meal = mealSnapshot.val();
        recipePromises.push(getRecipeDetails(uid, meal.recipeId));
      });
    });
    
    // Wait for all recipes to load
    const recipes = await Promise.all(recipePromises);
    
    // Collect all ingredients
    const allIngredients = new Set();
    
    recipes.forEach(recipe => {
      if (recipe.ingredients) {
        recipe.ingredients.split('\n').forEach(ingredient => {
          if (ingredient.trim()) {
            allIngredients.add(ingredient.trim());
          }
        });
      }
    });
    
    // Clear existing shopping list
    await remove(shoppingListRef);
    
    // Add new ingredients to shopping list
    const addPromises = Array.from(allIngredients).map(ingredient => {
      return push(shoppingListRef, { ingredient });
    });
    
    await Promise.all(addPromises);
    showToast('Shopping list generated successfully!');
    window.location.href = 'shopping-list.html';
  }, { onlyOnce: true });
});

// Global function to remove a meal
window.removeMeal = (day, mealId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const mealRef = ref(db, `mealPlans/${uid}/${day}/${mealId}`);
  remove(mealRef)
    .then(() => showToast('Meal removed'))
    .catch(() => showToast('Failed to remove meal', 'error'));
};


// Add template functions
function loadMealPlanTemplates(uid) {
  const templatesRef = ref(db, `users/${uid}/mealTemplates`);
  
  onValue(templatesRef, (snapshot) => {
    const templatesGrid = document.getElementById('templatesGrid');
    templatesGrid.innerHTML = '';
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const template = child.val();
        const templateElement = document.createElement('div');
        templateElement.className = 'template-card';
        templateElement.innerHTML = `
          <h3>${template.name}</h3>
          <p>Created: ${new Date(template.createdAt).toLocaleDateString()}</p>
          <button onclick="applyTemplate('${child.key}')" class="btn">
            <i class="fas fa-check"></i> Apply
          </button>
          <button onclick="deleteTemplate('${child.key}')" class="btn btn-outline">
            <i class="fas fa-trash"></i>
          </button>
        `;
        templatesGrid.appendChild(templateElement);
      });
    }
  });
}

window.applyTemplate = (templateId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  if (confirm('Apply this template? This will overwrite your current meal plan.')) {
    const templateRef = ref(db, `users/${uid}/mealTemplates/${templateId}`);
    const mealPlanRef = ref(db, `mealPlans/${uid}`);
    
    onValue(templateRef, (snapshot) => {
      const template = snapshot.val();
      update(mealPlanRef, template.days)
        .then(() => showToast('Template applied!'))
        .catch(() => showToast('Failed to apply template', 'error'));
    }, { onlyOnce: true });
  }
};

window.deleteTemplate = (templateId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  if (confirm('Delete this template?')) {
    const templateRef = ref(db, `users/${uid}/mealTemplates/${templateId}`);
    remove(templateRef)
      .then(() => showToast('Template deleted'))
      .catch(() => showToast('Failed to delete template', 'error'));
  }
};

document.getElementById('saveAsTemplateBtn')?.addEventListener('click', () => {
  const name = prompt('Enter template name:');
  if (!name) return;
  
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const mealPlanRef = ref(db, `mealPlans/${uid}`);
  const templatesRef = ref(db, `users/${uid}/mealTemplates`);
  const newTemplateRef = push(templatesRef);
  
  onValue(mealPlanRef, (snapshot) => {
    const days = snapshot.val() || {};
    update(newTemplateRef, {
      name,
      days,
      createdAt: Date.now()
    })
      .then(() => showToast('Template saved!'))
      .catch(() => showToast('Failed to save template', 'error'));
  }, { onlyOnce: true });
});



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