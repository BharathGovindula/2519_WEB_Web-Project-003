import { auth, db, storage } from '../firebase-config.js';
import { ref, push, onValue, remove, update, increment, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { showToast, displayStars, shareRecipeByEmail } from './utils.js';
import { loadCollections } from './collections.js';

// DOM Elements
const recipeForm = document.getElementById('recipeForm');
const container = document.getElementById('recipesContainer');
const filterCategory = document.getElementById('filterCategory');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortBy');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const imagePreview = document.getElementById('imagePreview');
const recipeImageInput = document.getElementById('recipeImage');

// Check if we're on the add recipe page
const isAddRecipePage = document.getElementById('recipeForm') && !document.getElementById('recipesContainer');

// Handle image preview
if (recipeImageInput) {
  recipeImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.style.display = 'none';
    }
  });
}

// Save draft functionality
if (saveDraftBtn) {
  saveDraftBtn.addEventListener('click', () => {
    const draft = {
      name: document.getElementById('recipeName').value,
      category: document.getElementById('category').value,
      cookTime: document.getElementById('cookTime').value,
      ingredients: document.getElementById('ingredients').value,
      instructions: document.getElementById('instructions').value,
      nutrition: {
        calories: document.getElementById('calories').value || null,
        protein: document.getElementById('protein').value || null,
        carbs: document.getElementById('carbs').value || null,
        fat: document.getElementById('fat').value || null
      }
    };
    
    localStorage.setItem('recipeDraft', JSON.stringify(draft));
    showToast('Draft saved successfully!');
  });
  
  // Load draft if exists
  window.addEventListener('DOMContentLoaded', () => {
    const draft = localStorage.getItem('recipeDraft');
    if (draft) {
      const data = JSON.parse(draft);
      document.getElementById('recipeName').value = data.name || '';
      document.getElementById('category').value = data.category || '';
      document.getElementById('cookTime').value = data.cookTime || '';
      document.getElementById('ingredients').value = data.ingredients || '';
      document.getElementById('instructions').value = data.instructions || '';
      
      // Load nutrition data if exists
      if (data.nutrition) {
        document.getElementById('calories').value = data.nutrition.calories || '';
        document.getElementById('protein').value = data.nutrition.protein || '';
        document.getElementById('carbs').value = data.nutrition.carbs || '';
        document.getElementById('fat').value = data.nutrition.fat || '';
      }
    }
  });
}

// Submit recipe form
if (recipeForm) {
  recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return location.href = 'auth.html';
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
      const recipeRef = ref(db, 'recipes/' + uid);
      const imageFile = recipeImageInput?.files[0];
      let imageUrl = '';
      
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
      
      const newRecipe = {
        name: document.getElementById('recipeName').value,
        category: document.getElementById('category').value,
        cookTime: document.getElementById('cookTime').value + ' mins',
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value,
        nutrition: {
          calories: document.getElementById('calories').value || null,
          protein: document.getElementById('protein').value || null,
          carbs: document.getElementById('carbs').value || null,
          fat: document.getElementById('fat').value || null
        },
        imageUrl,
        likes: 0,
        views: 0,
        rating: 0,
        createdAt: Date.now()
      };
      
      await push(recipeRef, newRecipe);
      showToast('Recipe saved successfully!');
      localStorage.removeItem('recipeDraft');
      
      if (isAddRecipePage) {
        recipeForm.reset();
        imagePreview.style.display = 'none';
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Save Recipe';
    }
  });
}

// Image upload to ImgBB
async function uploadImageToImgBB(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('https://api.imgbb.com/1/upload?key=c6dbd8283473af36fddf1a0f62a12a90', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  if (!data.success) throw new Error('Image upload failed');
  return data.data.url;
}

// Load and display recipes
export function loadRecipes(uid) {
  const recipeRef = ref(db, 'recipes/' + uid);
  const category = filterCategory?.value || 'All';
  const search = searchInput?.value.toLowerCase() || '';
  const sortBy = sortSelect?.value || 'createdAt';
  
  onValue(recipeRef, (snapshot) => {
    const recipes = [];
    snapshot.forEach((child) => {
      const recipe = child.val();
      recipe.id = child.key;
      recipes.push(recipe);
    });
    
    // Filter recipes
    const filtered = recipes.filter(recipe => 
      (category === 'All' || recipe.category === category) &&
      (recipe.name.toLowerCase().includes(search) || 
       recipe.ingredients.toLowerCase().includes(search))
    );
    
    // Sort recipes
    filtered.sort((a, b) => {
      if (sortBy === 'createdAt') return b.createdAt - a.createdAt;
      if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
    
    // Render recipes
    if (container) {
      container.innerHTML = filtered.map(recipe => `
        <div class="recipe-card" data-id="${recipe.id}">
          ${recipe.imageUrl ? `
            <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image" loading="lazy">
          ` : `
            <div class="recipe-image placeholder">
              <i class="fas fa-utensils"></i>
            </div>
          `}
          
          <div class="recipe-content">
            <div class="recipe-header">
              <h3 class="recipe-title" onclick="incrementView('${recipe.id}')">${recipe.name}</h3>
              <div class="recipe-actions-menu">
                <button class="action-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
                <div class="action-menu">
                  <button onclick="editRecipe('${uid}', '${recipe.id}')"><i class="fas fa-edit"></i> Edit</button>
                  <button onclick="deleteRecipe('${uid}', '${recipe.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
              </div>
            </div>
            
            <div class="recipe-meta">
              <span>${recipe.cookTime}</span>
              <span class="recipe-category">${recipe.category}</span>
            </div>
            
            ${recipe.nutrition?.calories ? `
              <div class="nutrition-badge">
                <i class="fas fa-fire"></i> ${recipe.nutrition.calories} kcal
                ${recipe.nutrition.protein ? ` | <i class="fas fa-dumbbell"></i> ${recipe.nutrition.protein}g` : ''}
                ${recipe.nutrition.carbs ? ` | <i class="fas fa-bread-slice"></i> ${recipe.nutrition.carbs}g` : ''}
                ${recipe.nutrition.fat ? ` | <i class="fas fa-bacon"></i> ${recipe.nutrition.fat}g` : ''}
              </div>
            ` : ''}
            
            <p class="recipe-description">
              ${recipe.ingredients.split('\n').slice(0, 3).join(', ')}
            </p>
            
            <div class="recipe-stats">
              <span class="stat-item">
                <i class="fas fa-heart"></i> ${recipe.likes || 0}
              </span>
              <span class="stat-item">
                <i class="fas fa-eye"></i> ${recipe.views || 0}
              </span>
              <span class="stat-item">
                <div class="star-rating" data-recipe-id="${recipe.id}">
                  ${[1, 2, 3, 4, 5].map(i => `
                    <i class="fas fa-star ${i <= (recipe.rating || 0) ? 'filled' : ''}" 
                       data-rating="${i}" 
                       onclick="rateRecipe('${uid}', '${recipe.id}', ${i})"></i>
                  `).join('')}
                </div>
              </span>
            </div>
            
            <div class="recipe-actions">
              <button onclick="likeRecipe('${recipe.id}')" class="action-btn btn-outline">
                <i class="fas fa-heart"></i> Like
              </button>
              <button onclick="addToShoppingList('${recipe.id}')" class="action-btn btn-outline">
                <i class="fas fa-shopping-basket"></i> Shop
              </button>
              <button onclick="shareRecipeByEmail('${recipe.id}')" class="action-btn btn-outline">
                <i class="fas fa-envelope"></i> Share
              </button>
              <button onclick="addToCollection('${recipe.id}')" class="action-btn btn-outline">
                <i class="fas fa-folder-plus"></i> Save
              </button>
              <button class="action-btn open-timer-btn">
                <i class="fas fa-clock"></i> Timer
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Add event listeners for the action menu
      document.querySelectorAll('.action-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const menu = btn.nextElementSibling;
          document.querySelectorAll('.action-menu').forEach(m => {
            if (m !== menu) m.style.display = 'none';
          });
          menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
      });

      // Close menus when clicking elsewhere
      document.addEventListener('click', () => {
        document.querySelectorAll('.action-menu').forEach(menu => {
          menu.style.display = 'none';
        });
      });
    }
  });
}

// Edit Recipe
window.editRecipe = (uid, recipeId) => {
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  onValue(recipeRef, (snapshot) => {
    const recipe = snapshot.val();
    // Store the recipe data in localStorage to pre-fill the edit form
    localStorage.setItem('editRecipeData', JSON.stringify({
      id: recipeId,
      ...recipe
    }));
    // Redirect to edit page
    window.location.href = 'edit-recipe.html';
  }, { onlyOnce: true });
};

// Delete Recipe
window.deleteRecipe = (uid, recipeId) => {
  if (confirm('Are you sure you want to delete this recipe?')) {
    const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
    remove(recipeRef)
      .then(() => showToast('Recipe deleted successfully'))
      .catch(error => showToast(error.message, 'error'));
  }
};

// Rate Recipe
window.rateRecipe = (uid, recipeId, rating) => {
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  update(recipeRef, { rating })
    .then(() => {
      showToast('Rating saved!');
      // Update the stars visually
      const stars = document.querySelectorAll(`.star-rating[data-recipe-id="${recipeId}"] .fa-star`);
      stars.forEach((star, i) => {
        if (i < rating) {
          star.classList.add('filled');
        } else {
          star.classList.remove('filled');
        }
      });
    })
    .catch(error => showToast(error.message, 'error'));
};

// Global functions (attached to window)
window.incrementView = (recipeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  update(recipeRef, { views: increment(1) });
};

window.likeRecipe = (recipeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  update(recipeRef, { likes: increment(1) })
    .then(() => showToast('Recipe liked!'))
    .catch(() => showToast('Failed to like recipe', 'error'));
};

window.addToShoppingList = (recipeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  const shoppingRef = ref(db, `shoppingList/${uid}`);
  
  onValue(recipeRef, (snapshot) => {
    const recipe = snapshot.val();
    const ingredients = recipe.ingredients.split('\n').map(ing => ing.trim());
    
    ingredients.forEach(ingredient => {
      if (ingredient) {
        push(shoppingRef, { ingredient });
      }
    });
    
    showToast('Ingredients added to shopping list!');
  }, { onlyOnce: true });
};

window.shareRecipeByEmail = async (recipeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  onValue(recipeRef, (snapshot) => {
    const recipe = snapshot.val();
    shareRecipeByEmail(recipe);
  }, { onlyOnce: true });
};

window.addToCollection = (recipeId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return location.href = 'auth.html';

  // Create a modal for selecting a collection
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Add to Collection</h2>
      <div id="collectionsList" class="collections-list">
        <!-- Collections will be loaded here -->
      </div>
      <div class="modal-actions">
        <button id="createNewCollectionBtn" class="btn">
          <i class="fas fa-plus"></i> Create New Collection
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal when clicking X or outside
  modal.querySelector('.close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Load user's collections
  const collectionsRef = ref(db, `users/${uid}/collections`);
  onValue(collectionsRef, (snapshot) => {
    const collectionsList = modal.querySelector('#collectionsList');
    collectionsList.innerHTML = '';

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const collection = child.val();
        const collectionItem = document.createElement('div');
        collectionItem.className = 'collection-item';
        collectionItem.innerHTML = `
          <h3>${collection.name}</h3>
          <p>${collection.recipes ? Object.keys(collection.recipes).length : 0} recipes</p>
          <button class="btn" onclick="saveRecipeToCollection('${uid}', '${child.key}', '${recipeId}')">
            <i class="fas fa-plus"></i> Add
          </button>
        `;
        collectionsList.appendChild(collectionItem);
      });
    } else {
      collectionsList.innerHTML = '<p>No collections found. Create one first.</p>';
    }
  });

  // Create new collection button
  modal.querySelector('#createNewCollectionBtn').addEventListener('click', () => {
    const name = prompt('Enter collection name:');
    if (!name) return;

    const newCollectionRef = push(collectionsRef);
    update(newCollectionRef, {
      name,
      createdAt: Date.now(),
      recipes: {
        [recipeId]: { addedAt: Date.now() }
      }
    })
      .then(() => {
        showToast('Collection created and recipe added!');
        modal.remove();
      })
      .catch((error) => showToast(error.message, 'error'));
  });
};

// Helper function to save recipe to collection
window.saveRecipeToCollection = (uid, collectionId, recipeId) => {
  const recipeRef = ref(db, `recipes/${uid}/${recipeId}`);
  const collectionRecipeRef = ref(db, `users/${uid}/collections/${collectionId}/recipes/${recipeId}`);

  // Get the recipe data first
  get(recipeRef).then((snapshot) => {
    if (snapshot.exists()) {
      // Save the recipe to the collection
      update(collectionRecipeRef, {
        ...snapshot.val(),
        addedAt: Date.now()
      })
        .then(() => {
          showToast('Recipe added to collection!');
          document.querySelector('.modal')?.remove();
        })
        .catch((error) => showToast(error.message, 'error'));
    } else {
      showToast('Recipe not found.', 'error');
    }
  });
};

// Initialize if on dashboard page
if (!isAddRecipePage) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadRecipes(user.uid);
      loadCollections();
      
      // Event listeners for filtering
      if (filterCategory) {
        filterCategory.addEventListener('change', () => loadRecipes(user.uid));
      }
      
      if (searchInput) {
        searchInput.addEventListener('input', () => loadRecipes(user.uid));
      }
      
      if (sortSelect) {
        sortSelect.addEventListener('change', () => loadRecipes(user.uid));
      }
    } else {
      location.href = 'auth.html';
    }
  });
}

// Close collection modal when clicking outside
window.addEventListener('click', (e) => {
  const collectionModal = document.getElementById('collectionModal');
  if (e.target === collectionModal) {
    collectionModal.style.display = 'none';
  }
});

// Create new collection
document.getElementById('createCollectionBtn')?.addEventListener('click', () => {
  const name = prompt('Enter collection name:');
  if (!name) return;
  
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  
  const collectionsRef = ref(db, `users/${uid}/collections`);
  const newCollectionRef = push(collectionsRef);
  
  update(newCollectionRef, {
    name,
    createdAt: Date.now(),
    recipes: {}
  })
    .then(() => showToast('Collection created!'))
    .catch((error) => showToast(error.message, 'error'));
});

// Close collection modal button
document.getElementById('closeCollectionModal')?.addEventListener('click', () => {
  document.getElementById('collectionModal').style.display = 'none';
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


window.exportAllRecipes = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return location.href = 'auth.html';

  const exportModal = document.createElement('div');
  exportModal.className = 'export-modal';
  exportModal.innerHTML = `
    <div class="export-modal-content">
      <h3>Exporting Recipes</h3>
      <div class="progress-container">
        <div class="progress-bar"></div>
        <div class="progress-text">Preparing...</div>
      </div>
      <button class="btn btn-outline cancel-export">Cancel</button>
    </div>
  `;
  document.body.appendChild(exportModal);

  try {
    const recipeRef = ref(db, `recipes/${uid}`);
    const snapshot = await get(recipeRef);
    
    if (!snapshot.exists()) {
      showToast('No recipes found to export', 'warning');
      exportModal.remove();
      return;
    }

    const recipes = [];
    let counter = 0;
    const total = snapshot.size;
    
    const updateProgress = () => {
      const percent = Math.round((counter / total) * 100);
      const progressBar = exportModal.querySelector('.progress-bar');
      const progressText = exportModal.querySelector('.progress-text');
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `Exporting ${counter} of ${total} recipes...`;
    };

    snapshot.forEach((child) => {
      const recipe = child.val();
      recipe.id = child.key;
      recipes.push(recipe);
      counter++;
      updateProgress();
    });

    // Create export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRecipes: recipes.length,
      recipes: recipes
    };

    // Create JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const exportFileName = `recipebook-export-${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = exportFileName;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${recipes.length} recipes successfully!`);
  } catch (error) {
    showToast(`Export failed: ${error.message}`, 'error');
    console.error('Export error:', error);
  } finally {
    exportModal.remove();
  }

  // Cancel button handler
  exportModal.querySelector('.cancel-export').addEventListener('click', () => {
    exportModal.remove();
    showToast('Export cancelled', 'warning');
  });
};



// Event delegation for save buttons
container.addEventListener('click', async (e) => {
  if (e.target.closest('.btn-save')) {
    const button = e.target.closest('.btn-save');
    const recipeId = button.dataset.id;
    const uid = auth.currentUser?.uid;

    if (!uid) return location.href = 'auth.html';

    try {
      // Example: save recipe to 'savedRecipes' node for the user
      const savedRef = ref(db, `users/${uid}/savedRecipes/${recipeId}`);
      const recipeSnapshot = await get(ref(db, `recipes/${uid}/${recipeId}`));
      if (recipeSnapshot.exists()) {
        await update(savedRef, recipeSnapshot.val());
        showToast('Recipe saved to your collection!');
      } else {
        showToast('Recipe not found.', 'error');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      showToast('Failed to save recipe.', 'error');
    }
  }
});
