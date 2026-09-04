import { auth, db } from "../config/firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("⚡ تم تحميل ملف login.js بنجاح!");

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

if (!form) {
  console.error("❌ لم يتم العثور على id='login-form' في ملف HTML! تأكد من تسمية الـ Form صح.");
} else {
  console.log("✅ تم العثور على login-form والملف جاهز للاستماع.");

  // --- دخول بالإيميل ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("1. تم الضغط على زر التسجيل...");

    if (errorMsg) {
      errorMsg.classList.remove("hidden", "success");
      errorMsg.classList.add("error");
    }

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email) return showError("اكتب البريد الإلكتروني");
    if (!password) return showError("اكتب كلمة المرور");

    try {
      console.log("2. جاري التحقق من Firebase Auth...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("3. تم التحقق بنجاح! UID:", cred.user.uid);

      await routeAfterLogin(cred.user.uid);
    } catch (err) {
      console.error("❌ خطأ تسجيل الدخول:", err);
      showError(mapFirebaseError(err.code));
    }
  });
}

// --- دخول بجوجل / فيسبوك ---
const googleBtn = document.getElementById("google-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", () => handleSocialLogin(new GoogleAuthProvider()));
}

const facebookBtn = document.getElementById("facebook-btn");
if (facebookBtn) {
  facebookBtn.addEventListener("click", () => handleSocialLogin(new FacebookAuthProvider()));
}

async function handleSocialLogin(provider) {
  if (errorMsg) errorMsg.classList.add("hidden");
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
      window.location.href = "/complete-profile";
      return;
    }

    if (existing.data().profileComplete === false) {
      window.location.href = "/complete-profile";
      return;
    }

    redirectAfterLogin(existing.data().accountType);
  } catch (err) {
    console.error("❌ خطأ الدخول الاجتماعي:", err);
    showError(mapFirebaseError(err.code));
  }
}

// --- نسيت كلمة المرور ---
const forgotBtn = document.getElementById("forgot-password");
if (forgotBtn) {
  forgotBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (errorMsg) errorMsg.classList.add("hidden");

    const email = document.getElementById("email")?.value.trim();
    if (!email) {
      return showError("اكتب إيميلك الأول في الخانة فوق عشان نبعتلك رابط إعادة التعيين");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showSuccess("تم إرسال رابط إعادة تعيين كلمة المرور على إيميلك");
    } catch (err) {
      showError(mapFirebaseError(err.code));
    }
  });
}

// --- التوجيه حسب نوع الحساب (بعد دخول بالإيميل) ---
async function routeAfterLogin(uid) {
  console.log("4. جاري قراءة نوع الحساب من Firestore...");
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    showError("الحساب غير موجود، حاول تسجيل حساب جديد");
    return;
  }

  console.log("5. بيانات المستخدم:", snap.data());
  redirectAfterLogin(snap.data().accountType);
}

function redirectAfterLogin(type) {
  console.log("6. جاري التوجيه حسب نوع الحساب:", type);
  window.location.href = type === "servant"
    ? "/servant-dashboard"
    : "../../index.html";
}

function showError(msg) {
  if (!errorMsg) return alert(msg);
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden", "success");
  errorMsg.classList.add("error");
}

function showSuccess(msg) {
  if (!errorMsg) return alert(msg);
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden", "error");
  errorMsg.classList.add("success");
}

function mapFirebaseError(code) {
  const map = {
    "auth/invalid-email": "البريد الإلكتروني غير صحيح",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول"
  };
  return map[code] || "حصل خطأ، حاول تاني";
}