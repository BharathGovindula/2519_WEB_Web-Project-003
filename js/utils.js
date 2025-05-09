export const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };
  
  export const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };
  
  export const displayStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  export const shareRecipeByEmail = (recipe) => {
    const subject = `Check out this recipe: ${recipe.name}`;
    const body = `
  Recipe: ${recipe.name}
  Category: ${recipe.category}
  Cooking Time: ${recipe.cookTime}
  
  Ingredients:
  ${recipe.ingredients}
  
  Instructions:
  ${recipe.instructions}
  
  Shared from RecipeBook App
    `;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };