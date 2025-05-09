import { auth, db, storage } from '../firebase-config.js';
import {
  ref,
  onValue,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { showToast } from './utils.js';

// DOM elements
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const profileForm = document.getElementById('profileForm');
const avatarUpload = document.getElementById('avatarUpload');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');

// Auth listener
auth.onAuthStateChanged((user) => {
  if (user) {
    loadUserProfile(user);
  } else {
    location.href = 'auth.html';
  }
});

// Load user profile
function loadUserProfile(user) {
  const profileRef = ref(db, `users/${user.uid}`);

  userName.textContent = user.displayName || 'User';
  userEmail.textContent = user.email;

  onValue(profileRef, (snapshot) => {
    if (snapshot.exists()) {
      const profile = snapshot.val();

      document.getElementById('displayName').value = profile.displayName || '';
      document.getElementById('bio').value = profile.bio || '';
      document.getElementById('location').value = profile.location || '';
      document.getElementById('favoriteCuisine').value = profile.favoriteCuisine || '';

      if (profile.avatarUrl) userAvatar.src = profile.avatarUrl;

      document.getElementById('recipeCount').textContent = profile.recipes?.length || 0;
      document.getElementById('likesCount').textContent = profile.totalLikes || 0;
      document.getElementById('mealPlansCount').textContent = profile.mealPlans?.length || 0;
      document.getElementById('ratingAvg').textContent = profile.avgRating?.toFixed(1) || 0;
    }
  });
}

// Avatar upload
changeAvatarBtn.addEventListener('click', () => avatarUpload.click());

avatarUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  const storageReference = storageRef(storage, `avatars/${user.uid}`);
  uploadBytes(storageReference, file)
    .then((snapshot) => getDownloadURL(snapshot.ref))
    .then((url) => {
      userAvatar.src = url;

      const profileRef = ref(db, `users/${user.uid}`);
      return update(profileRef, { avatarUrl: url });
    })
    .then(() => showToast('Avatar updated!'))
    .catch((error) => showToast(error.message, 'error'));
});

// Save profile
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const updates = {
    displayName: document.getElementById('displayName').value,
    bio: document.getElementById('bio').value,
    location: document.getElementById('location').value,
    favoriteCuisine: document.getElementById('favoriteCuisine').value,
    updatedAt: Date.now()
  };

  const profileRef = ref(db, `users/${user.uid}`);
  update(profileRef, updates)
    .then(() => {
      showToast('Profile saved!');
      userName.textContent = updates.displayName || 'User';
    })
    .catch((error) => showToast(error.message, 'error'));
});
