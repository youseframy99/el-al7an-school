import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8oBF0wWzLC7kxk7uzR4Wn5pWTC7BZavo",
  authDomain: "el-al7an-school.firebaseapp.com",
  projectId: "el-al7an-school",
  storageBucket: "el-al7an-school.firebasestorage.app",
  messagingSenderId: "1063809387413",
  appId: "1:1063809387413:web:2cd2a2ca849442f9b7c49c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);