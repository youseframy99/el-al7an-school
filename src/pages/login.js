import { auth, db } from "../config/firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("⚡ تم تحميل ملف login.js بنجاح!");

let loginMethod = "email"; // النمط الافتراضي (email أو phone)

document.addEventListener("DOMContentLoaded", () => {
  // --- تفعيل زر إظهار/إخفاء كلمة المرور ---
  document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });

  // --- التبديل بين البريد الإلكتروني والهاتف ---
  const tabEmail = document.getElementById("tab-email");
  const tabPhone = document.getElementById("tab-phone");
  const emailGroup = document.getElementById("email-group");
  const phoneGroup = document.getElementById("phone-group");

  if (tabEmail && tabPhone) {
    tabEmail.addEventListener("click", () => {
      loginMethod = "email";
      tabEmail.classList.add("active");
      tabPhone.classList.remove("active");
      emailGroup.classList.add("active");
      phoneGroup.classList.remove("active");
    });

    tabPhone.addEventListener("click", () => {
      loginMethod = "phone";
      tabPhone.classList.add("active");
      tabEmail.classList.remove("active");
      phoneGroup.classList.add("active");
      emailGroup.classList.remove("active");
    });
  }
});

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

if (!form) {
  console.error("❌ لم يتم العثور على id='login-form' في ملف HTML!");
} else {
  // --- التعامل مع تسجيل الدخول ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorMsg) {
      errorMsg.classList.remove("hidden", "success");
      errorMsg.classList.add("error");
    }

    const password = document.getElementById("password")?.value;
    if (!password) return showError("اكتب كلمة المرور");

    let targetEmail = "";

    if (loginMethod === "email") {
      targetEmail = document.getElementById("email")?.value.trim();
      if (!targetEmail) return showError("اكتب البريد الإلكتروني");
    } else {
      const phoneInput = document.getElementById("phone")?.value.trim();
      if (!phoneInput) return showError("اكتب رقم الهاتف أو الواتساب");

      try {
        const usersRef = collection(db, "users");
        
        // البحث بالاستعلام المباشر في حقل whatsapp وحقل phone وحقل phoneNumber
        let q = query(usersRef, where("whatsapp", "==", phoneInput));
        let querySnap = await getDocs(q);

        if (querySnap.empty) {
          q = query(usersRef, where("phone", "==", phoneInput));
          querySnap = await getDocs(q);
        }

        if (querySnap.empty) {
          q = query(usersRef, where("phoneNumber", "==", phoneInput));
          querySnap = await getDocs(q);
        }

        if (querySnap.empty) {
          return showError("رقم الهاتف غير مسجل بالنظام!");
        }

        targetEmail = querySnap.docs[0].data().email;

        if (!targetEmail) {
          return showError("لا يوجد بريد إلكتروني مرتبط برقم الهاتف هذا.");
        }
      } catch (err) {
        console.error("خطأ أثناء البحث عن الحساب برقم الهاتف:", err);
        return showError("حدث خطأ أثناء البحث عن الحساب برقم الهاتف.");
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, targetEmail, password);
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

    const userData = existing.data();

    if (userData.profileComplete === false) {
      window.location.href = "/complete-profile";
      return;
    }

    if (userData.accountType === "student" && userData.status === "pending") {
      showError("حسابك قيد المراجعة بواسطة الخدام المشرفين ولم يتم تفعيله بعد.");
      await signOut(auth);
      return;
    }

    redirectAfterLogin(userData.accountType);
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

    let email = document.getElementById("email")?.value.trim();

    if (!email && loginMethod === "phone") {
      return showError("يرجى اختيار تبويب (البريد الإلكتروني) وكتابته لإعادة تعيين كلمة المرور");
    }

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

async function routeAfterLogin(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    showError("الحساب غير موجود، حاول تسجيل حساب جديد");
    return;
  }

  const userData = snap.data();

  if (userData.accountType === "student" && userData.status === "pending") {
    showError("حسابك قيد المراجعة بواسطة الخدام المشرفين ولم يتم تفعيله بعد.");
    await signOut(auth);
    return;
  }

  redirectAfterLogin(userData.accountType);
}

function redirectAfterLogin(type) {
  window.location.href = type === "servant"
    ? "/servant-dashboard"
    : "/";
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
    "auth/user-not-found": "لا يوجد حساب بهذه البيانات",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة",
    "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول"
  };
  return map[code] || "حصل خطأ، حاول تاني";
}