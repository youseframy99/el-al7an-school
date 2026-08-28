import { auth, db } from "../config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("signup-form");
const accountType = document.getElementById("accountType");
const studentFields = document.getElementById("student-fields");
const servantFields = document.getElementById("servant-fields");
const errorMsg = document.getElementById("error-msg");

accountType.addEventListener("change", () => {
  const isStudent = accountType.value === "student";
  studentFields.classList.toggle("hidden", !isStudent);
  servantFields.classList.toggle("hidden", isStudent);
});

// --- تسجيل بالإيميل ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.classList.add("hidden");

  const fullName = document.getElementById("fullName").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const type = accountType.value;

  let profileData = {
    fullName, whatsapp, email,
    accountType: type,
    createdAt: new Date().toISOString()
  };

  if (type === "student") {
    const grade = document.getElementById("studentGrade").value;
    if (!grade) return showError("من فضلك اختر المرحلة الدراسية");
    profileData.grade = grade;
    profileData.classId = grade;
    profileData.points = 0;
    profileData.level = 1;
    profileData.attendanceRate = 0;
  }

  if (type === "servant") {
    const grades = Array.from(
      document.querySelectorAll('input[name="servantGrade"]:checked')
    ).map(cb => cb.value);
    const subject = document.getElementById("servantSubject").value;

    if (grades.length === 0) return showError("اختر مرحلة واحدة على الأقل");
    if (!subject) return showError("اختر المادة");

    profileData.grades = grades;
    profileData.subject = subject;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // تحديث الاسم في حساب الـ Auth لتسريع التنسيق
    await updateProfile(cred.user, { displayName: fullName });

    // حفظ البيانات في Firestore
    await setDoc(doc(db, "users", cred.user.uid), profileData);
    
    redirectAfterLogin(type);
  } catch (err) {
    showError(mapFirebaseError(err.code));
  }
});

// --- تسجيل بجوجل / فيسبوك ---
document.getElementById("google-btn").addEventListener("click", () => {
  handleSocialLogin(new GoogleAuthProvider());
});
document.getElementById("facebook-btn").addEventListener("click", () => {
  handleSocialLogin(new FacebookAuthProvider());
});

async function handleSocialLogin(provider) {
  errorMsg.classList.add("hidden");
  try {
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", result.user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        fullName: result.user.displayName || "",
        email: result.user.email || "",
        createdAt: new Date().toISOString(),
        profileComplete: false
      });
      window.location.href = "./complete-profile.html";
    } else if (existing.data().profileComplete === false) {
      window.location.href = "./complete-profile.html";
    } else {
      redirectAfterLogin(existing.data().accountType);
    }
  } catch (err) {
    showError(mapFirebaseError(err.code));
  }
}

function redirectAfterLogin(type) {
  window.location.href = type === "servant"
    ? "./servant-dashboard.html"
    : "../../index.html";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function mapFirebaseError(code) {
  const map = {
    "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
    "auth/invalid-email": "البريد الإلكتروني غير صحيح",
    "auth/weak-password": "كلمة المرور ضعيفة (6 أحرف على الأقل)",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول"
  };
  return map[code] || "حصل خطأ، حاول تاني";
}