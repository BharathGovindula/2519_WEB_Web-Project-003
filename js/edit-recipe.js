import { auth, db, storage } from '../firebase-config.js';
import { ref, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { showToast } from './utils.js';

// DOM Elements
const recipeForm = document.getElementById('recipeForm');
const recipeIdInput = document.getElementById('recipeId');
const deleteBtn = document.getElementById('deleteBtn');
const imagePreview = document.getElementById('imagePreview');
const recipeImageInput = document.getElementById('recipeImage');

// Load recipe data from localStorage
const recipeData = JSON.parse(localStorage.getItem('editRecipeData'));
if (!recipeData) {
  showToast('No recipe data found', 'error');
  window.location.href = 'index.html';
}

// Pre-fill the form
window.addEventListener('DOMContentLoaded', () => {
  recipeIdInput.value = recipeData.id;
  document.getElementById('recipeName').value = recipeData.name || '';
  document.getElementById('category').value = recipeData.category || '';
  
  // Extract minutes from cookTime string
  const cookTime = recipeData.cookTime ? parseInt(recipeData.cookTime.replace(' mins', '')) : '';
  document.getElementById('cookTime').value = cookTime;
  
  document.getElementById('ingredients').value = recipeData.ingredients || '';
  document.getElementById('instructions').value = recipeData.instructions || '';
  
  // Load nutrition data if exists
  if (recipeData.nutrition) {
    document.getElementById('calories').value = recipeData.nutrition.calories || '';
    document.getElementById('protein').value = recipeData.nutrition.protein || '';
    document.getElementById('carbs').value = recipeData.nutrition.carbs || '';
    document.getElementById('fat').value = recipeData.nutrition.fat || '';
  }
  
  // Load image preview if exists
  if (recipeData.imageUrl) {
    imagePreview.innerHTML = `<img src="${recipeData.imageUrl}" alt="Preview">`;
    imagePreview.style.display = 'block';
  }
});

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

// Submit recipe form
if (recipeForm) {
  recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return location.href = 'auth.html';
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
      const recipeRef = ref(db, 'recipes/' + uid + '/' + recipeData.id);
      const imageFile = recipeImageInput?.files[0];
      let imageUrl = recipeData.imageUrl || '';
      
      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
      
      const updatedRecipe = {
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
        updatedAt: Date.now()
      };
      
      await update(recipeRef, updatedRecipe);
      showToast('Recipe updated successfully!');
      localStorage.removeItem('editRecipeData');
      setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Update Recipe';
    }
  });
}

// Delete recipe
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const uid = auth.currentUser?.uid;
      if (!uid) return location.href = 'auth.html';
      
      const recipeRef = ref(db, 'recipes/' + uid + '/' + recipeData.id);
      remove(recipeRef)
        .then(() => {
          showToast('Recipe deleted successfully');
          localStorage.removeItem('editRecipeData');
          setTimeout(() => window.location.href = 'index.html', 1500);
        })
        .catch(error => showToast(error.message, 'error'));
    }
  });
}

// Image upload to ImgBB (same as in recipes.js)
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