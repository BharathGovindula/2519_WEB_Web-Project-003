import { auth, db } from '../firebase-config.js';
import { ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { showToast } from './utils.js';

export const loadCollections = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const collectionsRef = ref(db, `users/${uid}/collections`);
  const collectionsContainer = document.getElementById('collectionsContainer');
  const createCollectionBtn = document.getElementById('createCollectionBtn');

  // Load collections from Firebase
  onValue(collectionsRef, (snapshot) => {
    collectionsContainer.innerHTML = '';

    if (!snapshot.exists()) {
      collectionsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder-open fa-2x" aria-label="No Collections Icon"></i>
          <p>No collections yet. Create your first one!</p>
        </div>
      `;
      return;
    }

    // Gather and sort collections by createdAt (newest first)
    const collections = [];
    snapshot.forEach((child) => {
      collections.push({ id: child.key, ...child.val() });
    });
    collections.sort((a, b) => b.createdAt - a.createdAt);

    // Render sorted collections
    collections.forEach(collection => {
      collectionsContainer.appendChild(createCollectionCard(collection.id, collection));
    });
  });

  // Create collection card HTML
  const createCollectionCard = (id, collection) => {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.innerHTML = `
      <div class="collection-actions">
        <button class="edit-btn" title="Edit Collection"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" title="Delete Collection"><i class="fas fa-trash-alt"></i></button>
      </div>
      <a href="collection.html?id=${id}">
        <div class="collection-image">
          ${collection.imageUrl ? 
            `<img src="${collection.imageUrl}" alt="${collection.name}" loading="lazy">` : 
            `<div class="default-collection-image">
              <i class="fas fa-book-open" aria-label="Default Collection Icon"></i>
            </div>`
          }
        </div>
        <div class="collection-info">
          <h3>${collection.name}</h3>
          <p>${collection.description || 'No description'}</p>
          <div class="collection-stats">
            <span><i class="fas fa-book"></i> ${collection.recipes ? Object.keys(collection.recipes).length : 0} recipes</span>
          </div>
        </div>
      </a>
    `;

    // Edit button functionality
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const newName = prompt('Enter new name:', collection.name)?.trim();
      if (!newName) return;

      const newDescription = prompt('Enter new description:', collection.description)?.trim() || '';
      const newImageUrl = prompt('Enter new image URL:', collection.imageUrl || '')?.trim() || '';

      const updatedCollection = {
        ...collection,
        name: newName,
        description: newDescription,
        imageUrl: newImageUrl,
      };

      update(ref(db, `users/${uid}/collections/${id}`), updatedCollection)
        .then(() => showToast('Collection updated successfully!'))
        .catch((err) => showToast(err.message, 'error'));
    });

    // Delete button functionality
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const confirmDelete = confirm(`Are you sure you want to delete "${collection.name}"?`);
      if (!confirmDelete) return;

      remove(ref(db, `users/${uid}/collections/${id}`))
        .then(() => showToast('Collection deleted.'))
        .catch((err) => showToast(err.message, 'error'));
    });

    return card;
  };

  // Create new collection
  createCollectionBtn?.addEventListener('click', () => {
    const name = prompt('Enter collection name:')?.trim();
    if (!name) return;

    const description = prompt('Enter description (optional):')?.trim() || '';
    const imageUrl = prompt('Enter image URL (optional):')?.trim() || '';

    const newCollection = {
      name,
      description,
      imageUrl,
      createdAt: Date.now(),
      recipes: {}
    };

    push(collectionsRef, newCollection)
      .then(() => {
        showToast('Collection created successfully!');
      })
      .catch((error) => {
        showToast(error.message, 'error');
      });
  });
};

// Initialize when auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    loadCollections();
  }
});
