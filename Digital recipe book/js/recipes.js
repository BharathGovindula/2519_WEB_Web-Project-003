
import { auth, db } from '../firebase-config.js';
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref, push, onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const recipeForm = document.getElementById('recipeForm');
const container = document.getElementById('recipesContainer');

onAuthStateChanged(auth, (user) => {
  if (!user) location.href = 'auth.html';
  else loadRecipes(user.uid);
});

recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const uid = auth.currentUser.uid;
  const recipeRef = ref(db, 'recipes/' + uid);
  const newRecipe = {
    name: document.getElementById('recipeName').value,
    ingredients: document.getElementById('ingredients').value,
    instructions: document.getElementById('instructions').value,
    cookTime: document.getElementById('cookTime').value,
    createdAt: Date.now()
  };
  push(recipeRef, newRecipe).then(() => {
    recipeForm.reset();
    alert("Recipe saved!");
  });
});

function loadRecipes(uid) {
  const recipeRef = ref(db, 'recipes/' + uid);
  onValue(recipeRef, snapshot => {
    container.innerHTML = '';
    snapshot.forEach(child => {
      const r = child.val();
      container.innerHTML += `
        <div>
          <h3>${r.name}</h3>
          <p><strong>Time:</strong> ${r.cookTime}</p>
          <p>${r.ingredients}</p>
          <p>${r.instructions}</p>
        </div>
        <hr />
      `;
    });
  });
}

window.logout = () => {
  signOut(auth).then(() => location.href = 'auth.html');
};
