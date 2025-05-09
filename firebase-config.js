import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSSaVvE2Bga0x1P85nxpJsrSc5GpUDHcA",
  authDomain: "digital-recipe-book-6a6fb.firebaseapp.com",
  databaseURL: "https://digital-recipe-book-6a6fb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digital-recipe-book-6a6fb",
  storageBucket: "digital-recipe-book-6a6fb.appspot.com",
  messagingSenderId: "551354415186",
  appId: "1:551354415186:web:366b362cb90bb0c104478b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };