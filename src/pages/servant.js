import { db, auth } from '../config/firebase-config';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// أول ما الصفحة تحمل بالكامل، نفذ الأكواد وربط الأزرار
document.addEventListener("DOMContentLoaded", () => {

  // 1. تفعيل زر تبديل الثيم (Light / Dark Mode) فوراً
  const themeToggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      let theme = "light";
      if (document.body.classList.contains("dark-mode")) {
        theme = "dark";
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
      localStorage.setItem("theme", theme);
    });
  }

  // 2. زر تسجيل الخروج للخادم
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = './src/pages/login.html';
      }).catch((error) => {
        console.error("خطأ أثناء تسجيل الخروج:", error);
      });
    });
  }

  // 3. معالجة نموذج رفع الألحان أو الامتحانات
  const uploadForm = document.getElementById("upload-hymn-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const classId = document.getElementById("target-class").value;
      const title = document.getElementById("hymn-title").value;
      const audioUrl = document.getElementById("audio-url").value;
      const pdfUrl = document.getElementById("pdf-url").value;
      const copticText = document.getElementById("coptic-text").value;
      const transliteratedText = document.getElementById("trans-text").value;
      const arabicText = document.getElementById("arabic-text").value;

      try {
        await addDoc(collection(db, "hymns"), {
          classId,
          title,
          audioUrl,
          pdfUrl,
          copticText,
          transliteratedText,
          arabicText,
          active: true,
          createdAt: new Date()
        });

        alert("تم نشر المحتوى بنجاح للمخدومين! 🚀");
        uploadForm.reset();
        await loadServantStats(classId);

      } catch (err) {
        console.error("خطأ أثناء النشر:", err);
        alert("حدث خطأ أثناء النشر، تأكد من الاتصال بقاعدة البيانات.");
      }
    });
  }

});

// 4. حماية الصفحة والتحقق من صلاحيات الخادم وجلب البيانات
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await verifyServantAccess(user);
  } else {
    window.location.href = './src/pages/login.html';
  }
});

async function verifyServantAccess(user) {
  const nameElem = document.getElementById("servant-name-display");
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // التأكد أن المستخدم خادم
      if (userData.accountType !== "servant" && userData.role !== "servant") {
        alert("عفواً، هذه الصفحة مخصصة للخدام فقط!");
        window.location.href = './index.html';
        return;
      }

      // عرض اسم الخادم الحقيقي بدل "جاري التحميل..."
      const servantName = userData.fullName || userData.name || user.displayName || "خادم الكنيسة";
      if (nameElem) {
        nameElem.innerText = servantName;
      }

      // جلب إحصائيات الفصل
      const classId = userData.classId || (userData.grades ? userData.grades[0] : "primary");
      await loadServantStats(classId);

    } else {
      if (nameElem) nameElem.innerText = "حساب خادم";
      alert("بيانات الحساب غير موجودة في قاعدة البيانات!");
    }
  } catch (err) {
    console.error("خطأ في التحقق من صلاحيات الخادم:", err);
    if (nameElem) nameElem.innerText = "خطأ في التحميل";
  }
}

// 5. جلب إحصائيات الخادم
async function loadServantStats(classId) {
  try {
    const studentsQuery = query(collection(db, "users"), where("classId", "==", classId));
    const studentsSnap = await getDocs(studentsQuery);
    const totalStudentsElem = document.getElementById("total-students");
    if (totalStudentsElem) totalStudentsElem.innerText = studentsSnap.size;

    const hymnsQuery = query(collection(db, "hymns"), where("classId", "==", classId));
    const hymnsSnap = await getDocs(hymnsQuery);
    const totalHymnsElem = document.getElementById("total-hymns");
    if (totalHymnsElem) totalHymnsElem.innerText = hymnsSnap.size;

  } catch (err) {
    console.error("خطأ في جلب الإحصائيات:", err);
  }
}