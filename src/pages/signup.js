import { auth, db } from "../config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("signup-form");
const accountType = document.getElementById("accountType");
const studentFields = document.getElementById("student-fields");
const servantFields = document.getElementById("servant-fields");
const errorMsg = document.getElementById("error-msg");
const isSupervisorCheck = document.getElementById("isSupervisorCheck");
const supervisorCodeGroup = document.getElementById("supervisor-code-group");

accountType.addEventListener("change", () => {
  const isStudent = accountType.value === "student";
  studentFields.classList.toggle("hidden", !isStudent);
  servantFields.classList.toggle("hidden", isStudent);
});

if (isSupervisorCheck) {
  isSupervisorCheck.addEventListener("change", () => {
    supervisorCodeGroup.classList.toggle("hidden", !isSupervisorCheck.checked);
  });
}

// --- تسجيل بالإيميل ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.classList.add("hidden");

  const fullName = document.getElementById("fullName").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;
  const type = accountType.value;

  if (confirmPassword && password !== confirmPassword) {
    return showError("كلمتا المرور غير متطابقتين!");
  }

  let profileData = {
    fullName, whatsapp, email,
    accountType: type,
    profileComplete: true,
    createdAt: new Date().toISOString()
  };

  let isSupervisor = false;

  if (type === "student") {
    const grade = document.getElementById("studentGrade").value;
    if (!grade) return showError("من فضلك اختر المرحلة الدراسية");
    profileData.grade = grade;
    profileData.classId = grade;
    profileData.points = 0;
    profileData.level = 1;
    profileData.attendanceRate = 0;
    profileData.status = "pending";
    profileData.isSupervisor = false;
  }

  if (type === "servant") {
    const grades = Array.from(
      document.querySelectorAll('input[name="servantGrade"]:checked')
    ).map(cb => cb.value);
    const subject = document.getElementById("servantSubject").value;
    const servantCodeInput = document.getElementById("servantCode").value.trim();
    const isSupervisorChoice = isSupervisorCheck ? isSupervisorCheck.checked : false;

    if (grades.length === 0) return showError("اختر مرحلة واحدة على الأقل");
    if (!subject) return showError("اختر المادة");
    if (!servantCodeInput) return showError("من فضلك أدخل كود التحقق الخاص بالخدام");

    try {
      const configRef = doc(db, "settings", "config");
      const configSnap = await getDoc(configRef);

      if (!configSnap.exists()) {
        return showError("خطأ في إعدادات النظام، تواصل مع المسؤول");
      }

      const configData = configSnap.data();
      const correctServantCode = configData.servantSecretCode || configData.servantCode;

      if (servantCodeInput !== correctServantCode) {
        return showError("كود التحقق الخاص بالخدام غير صحيح!");
      }

      if (isSupervisorChoice) {
        const supervisorCodeInput = document.getElementById("supervisorCode").value.trim();
        if (!supervisorCodeInput) {
          return showError("من فضلك أدخل كود التحقق الخاص بالخادم المشرف");
        }
        const correctSupervisorCode = configData.supervisorSecretCode || configData.supervisorCode;
        if (supervisorCodeInput !== correctSupervisorCode) {
          return showError("كود التحقق الخاص بالخادم المشرف غير صحيح!");
        }
        isSupervisor = true;
      }
    } catch (err) {
      console.error(err);
      return showError("حدث خطأ أثناء التحقق من الكود");
    }

    profileData.grades = grades;
    profileData.subject = subject;
    profileData.status = "approved";
    profileData.isSupervisor = isSupervisor;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(cred.user, { displayName: fullName });

    await setDoc(doc(db, "users", cred.user.uid), profileData);
    
    if (type === "student") {
      alert("تم إنشاء حسابك بنجاح! حسابك الآن قيد المراجعة بواسطة الخدام المشرفين ولن تتمكن من الدخول حتى تتم الموافقة عليه.");
      await signOut(auth);
      window.location.href = "/login";
    } else {
      window.location.href = "/servant-dashboard";
    }
  } catch (err) {
    showError(mapFirebaseError(err.code));
  }
});

// --- تسجيل بجوجل / فيسبوك ---
document.getElementById("google-btn").addEventListener("click", () => {
  handleSocialLogin(new GoogleAuthProvider());
});

document.getElementById("facebook-btn").addEventListener("click", () => {
  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  handleSocialLogin(facebookProvider);
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
      window.location.href = "/complete-profile";
    } else if (existing.data().profileComplete === false) {
      window.location.href = "/complete-profile";
    } else {
      const userData = existing.data();
      if (userData.accountType === "student" && userData.status === "pending") {
        alert("حسابك قيد المراجعة بواسطة الخدام المشرفين ولم يتم تفعيله بعد.");
        await signOut(auth);
        window.location.href = "/login";
      } else {
        redirectAfterLogin(userData.accountType);
      }
    }
  } catch (err) {
    showError(mapFirebaseError(err.code));
  }
}

function redirectAfterLogin(type) {
  window.location.href = type === "servant"
    ? "/servant-dashboard"
    : "/";
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