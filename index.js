import { db, auth } from './src/config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// دالة حساب المستوى ديناميكياً (كل 30 نقطة مستوى جديد)[cite: 8]
function calculateLevel(points) {
  const pts = Number(points) || 0;
  return Math.floor(pts / 30) + 1; 
}

// دالة لتطبيق الإعدادات والألوان المخصصة محلياً (لهذا المخدوم فقط)[cite: 8]
function applyUserPreferences() {
  const savedFontSize = localStorage.getItem('user_font_size');
  const savedBgColor = localStorage.getItem('user_custom_bg');
  const savedTextColor = localStorage.getItem('user_custom_text');

  if (savedFontSize) {
    document.body.style.fontSize = savedFontSize;
  } else {
    document.body.style.fontSize = "";
  }

  if (savedBgColor) {
    document.body.style.backgroundColor = savedBgColor;
  } else {
    document.body.style.backgroundColor = "";
  }

  if (savedTextColor) {
    document.body.style.color = savedTextColor;
  } else {
    document.body.style.color = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyUserPreferences();

  const themeToggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark" && !localStorage.getItem('user_custom_bg')) {
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
      localStorage.removeItem("user_custom_bg");
      localStorage.removeItem("user_custom_text");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    });
  }

  // عناصر نافذة الإعدادات (Modal) ومربعات الألوان[cite: 8]
  const settingsModal = document.getElementById("settings-modal");
  const settingsOpenBtn = document.getElementById("settings-open-btn");
  const closeSettingsBtn = document.getElementById("close-settings");
  const saveSettingsBtn = document.getElementById("save-settings");
  const resetSettingsBtn = document.getElementById("reset-settings");

  const bgColorPicker = document.getElementById("bg-color-picker");
  const textColorPicker = document.getElementById("text-color-picker");

  if (settingsOpenBtn && settingsModal) {
    settingsOpenBtn.addEventListener("click", () => {
      settingsModal.style.display = "flex";
      if (bgColorPicker && localStorage.getItem('user_custom_bg')) {
        bgColorPicker.value = localStorage.getItem('user_custom_bg');
      }
      if (textColorPicker && localStorage.getItem('user_custom_text')) {
        textColorPicker.value = localStorage.getItem('user_custom_text');
      }
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  // تطبيق الألوان فوراً عند تحريك المربع أو اختيار الدرجة[cite: 8]
  if (bgColorPicker) {
    bgColorPicker.addEventListener("input", (e) => {
      const color = e.target.value;
      document.body.style.backgroundColor = color;
      localStorage.setItem("user_custom_bg", color);
    });
  }

  if (textColorPicker) {
    textColorPicker.addEventListener("input", (e) => {
      const color = e.target.value;
      document.body.style.color = color;
      localStorage.setItem("user_custom_text", color);
    });
  }

  // اختيار حجم الخط[cite: 8]
  const fontSizeBtns = document.querySelectorAll(".font-size-btn");
  fontSizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      fontSizeBtns.forEach(b => b.style.borderColor = "#ccc");
      btn.style.borderColor = "var(--color-primary, #2980b9)";
      const size = btn.getAttribute("data-size");
      document.body.style.fontSize = size;
      localStorage.setItem("user_font_size", size);
    });
  });

  // زر إعادة الضبط للافتراضي (Reset to Default)[cite: 8]
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
      localStorage.removeItem("user_font_size");
      localStorage.removeItem("user_custom_bg");
      localStorage.removeItem("user_custom_text");
      localStorage.removeItem("theme");
      document.body.classList.remove("dark-mode");
      applyUserPreferences();
      settingsModal.style.display = "none";
    });
  }

  if (saveSettingsBtn && settingsModal) {
    saveSettingsBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = '/login';
      }).catch((error) => {
        console.error("خطأ أثناء تسجيل الخروج:", error);
      });
    });
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const studentDocRef = doc(db, "users", user.uid);
      const studentSnap = await getDoc(studentDocRef);

      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const accountType = (studentData.accountType || "").toLowerCase();

        // 🛡️ الحراسة الأمنية: منع الخادم من دخول صفحة المخدوم وتوجيهه تلقائياً للكنترول الخاص به
        if (accountType === "servant") {
          window.location.href = "/servant-dashboard";
          return;
        }
        
        if (accountType === "student" && studentData.status === "pending") {
          alert("عذراً، حسابك قيد المراجعة ولم يتم اعتماده من قِبل خادم الفصول بعد. برجاء الانتظار لحين قبول الطلب.");
          await signOut(auth);
          window.location.href = '/login';
          return;
        }
      }
    } catch (e) {
      console.error("خطأ في التحقق من حالة الحساب:", e);
    }

    await loadStudentDashboard(user);
  } else {
    window.location.href = '/login';
  }
});

async function loadStudentDashboard(user) {
  const nameDisplay = document.getElementById("user-name-display");

  try {
    const studentDocRef = doc(db, "users", user.uid);
    const studentSnap = await getDoc(studentDocRef);

    let fullName = "";
    let classId = "";

    if (studentSnap.exists()) {
      const studentData = studentSnap.data();
      fullName = studentData.fullName || studentData.name || studentData.studentName || "";
      classId = studentData.classId || studentData.grade || "";

      const points = Number(studentData.points) || 0;
      // حساب المستوى ديناميكياً بدقة (كل 30 نقطة مستوى جديد)[cite: 8]
      const currentLevel = calculateLevel(points);

      document.getElementById("user-level").innerHTML = `<i class="fa-solid fa-crown"></i> المستوى: ${currentLevel}`;
      document.getElementById("user-points").innerText = points;

      if (classId) {
        const allUsersSnap = await getDocs(collection(db, "users"));
        let classStudents = [];
        allUsersSnap.forEach(docSnap => {
          const d = docSnap.data();
          const dClass = d.classId || d.grade || "";
          const isStudent = (d.accountType === "student" || !d.accountType) && d.status === "approved";
          
          if (isStudent && dClass.toString().trim().toLowerCase() === classId.toString().trim().toLowerCase()) {
            classStudents.push({ uid: docSnap.id, points: Number(d.points) || 0 });
          }
        });
        
        classStudents.sort((a, b) => b.points - a.points);
        
        let myRank = 1;
        let found = false;
        for (let i = 0; i < classStudents.length; i++) {
          if (i > 0 && classStudents[i].points < classStudents[i - 1].points) {
            myRank = i + 1;
          }
          if (classStudents[i].uid === user.uid) {
            found = true;
            break;
          }
        }
        
        if (found) {
          document.getElementById("user-rank").innerText = `#${myRank}`;
        } else {
          document.getElementById("user-rank").innerText = `--`;
        }
      }

      // جلب سجل الحضور والغياب مع فلترة واستبعاد الأيام الفارغة التي حُفظت بالخطأ
      const attendanceCollRef = collection(db, "students", user.uid, "attendance");
      const attSnap = await getDocs(attendanceCollRef);
      
      let totalValidClasses = 0;
      let attendedClasses = 0;
      
      attSnap.forEach(docSnap => {
        const attData = docSnap.data();
        const isPresent = attData.present === true || attData.status === "present";
        
        // احتساب الاجتماعات الصالحة فقط التي تم تسجيل حضور أو غياب فعلي فيها
        if (attData.present !== undefined || attData.status !== undefined) {
          totalValidClasses++;
          if (isPresent) {
            attendedClasses++;
          }
        }
      });

      let attendanceRate = totalValidClasses > 0 ? Math.round((attendedClasses / totalValidClasses) * 100) : 0;
      document.getElementById("user-attendance").innerText = `${attendanceRate}%`;
    }

    const finalName = fullName || user.displayName || (user.email ? user.email.split('@')[0] : "مخدوم الكنيسة");
    if (nameDisplay) nameDisplay.innerText = finalName;

    const curriculumBtn = document.getElementById("curriculum-anchor-btn");
    if (curriculumBtn && classId) {
      curriculumBtn.href = `/student-curriculum?classId=${classId}`;
    }

    if (classId) {
      await loadAvailableExams(classId);
      await loadStudentGrades(user.uid);
      await loadLeaderboard(classId);
    } else {
      document.getElementById("exams-container").innerHTML = `<p style="color: red;">برجاء التواصل مع الخادم لتحديد مرحلتك الدراسية في النظام.</p>`;
    }

  } catch (error) {
    console.error("خطأ في جلب بيانات الطالب:", error);
    if (nameDisplay) nameDisplay.innerText = user.displayName || "مخدوم الكنيسة";
  }
}

async function loadAvailableExams(studentGrade) {
  const examsContainer = document.getElementById("exams-container");
  
  try {
    const examsQuery = query(collection(db, "quizzes"));
    const snapshot = await getDocs(examsQuery);

    if (snapshot.empty) {
      examsContainer.innerHTML = `<p style="color: var(--text-muted);">لا توجد امتحانات مضافة في النظام حالياً.</p>`;
      return;
    }

    let html = "";
    let foundCount = 0;

    snapshot.forEach(docSnap => {
      const exam = docSnap.data();
      const examId = docSnap.id;
      const examGrade = exam.grade || "";
      
      if (examGrade.toString().trim().toLowerCase() === studentGrade.toString().trim().toLowerCase()) {
        foundCount++;
        html += `
          <div style="background: var(--color-bg); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--color-border);">
            <h4 style="margin: 0 0 8px 0; color: var(--color-primary);">${exam.title || 'امتحان أسبوعي'}</h4>
            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--color-text-muted);">المادة: ${exam.subject || '-'}</p>
            <a href="/exam-room?examId=${examId}" class="btn-quiz" style="padding: 8px 14px; background: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 0.9rem;">
              <i class="fa-solid fa-pen-to-square"></i> ابدأ الامتحان المقرر
            </a>
          </div>
        `;
      }
    });

    if (foundCount === 0) {
      examsContainer.innerHTML = `<p style="color: var(--text-muted);">لا توجد امتحانات مقررة لمرحلتك الدراسية حالياً.</p>`;
    } else {
      examsContainer.innerHTML = html;
    }

  } catch (err) {
    console.error("خطأ في تحميل الامتحانات:", err);
    examsContainer.innerHTML = `<p style="color: red;">حدث خطأ أثناء تحميل الامتحانات المقررة.</p>`;
  }
}

async function loadStudentGrades(studentId) {
  const gradesContainer = document.getElementById("student-grades-container");
  try {
    const resultsQuery = query(
      collection(db, "examResults"),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(resultsQuery);

    if (snapshot.empty) {
      gradesContainer.innerHTML = `<p style="color: var(--text-muted);">لم يتم رصد درجات لك حتى الآن.</p>`;
      return;
    }

    let html = `<table style="width:100%; border-collapse: collapse; font-size: 0.95rem;">
      <tr style="border-bottom: 2px solid var(--color-border); text-align: right;">
        <th style="padding: 8px;">الامتحان</th>
        <th style="padding: 8px;">الدرجة</th>
        <th style="padding: 8px;">الحالة</th>
      </tr>`;

    snapshot.forEach(docSnap => {
      const res = docSnap.data();
      const statusText = res.fullyGraded ? 'تم التصحيح نهائياً' : 'في انتظار تصحيح المقالي من الكنترول';
      html += `
        <tr style="border-bottom: 1px solid var(--color-border);">
          <td style="padding: 8px;">${res.examTitle || 'امتحان'}</td>
          <td style="padding: 8px; font-weight: bold; color: var(--color-accent);">${res.totalScore !== undefined ? res.totalScore : 'قيد التصحيح'}</td>
          <td style="padding: 8px; font-size: 0.85rem; color: var(--color-text-muted);">${statusText}</td>
        </tr>
      `;
    });
    html += `</table>`;
    gradesContainer.innerHTML = html;
  } catch (err) {
    console.error("خطأ في تحميل الدرجات:", err);
    gradesContainer.innerHTML = `<p style="color: red;">فشل تحميل الدرجات.</p>`;
  }
}

async function loadLeaderboard(classId) {
  const lbContainer = document.getElementById("leaderboard-container");
  if (!lbContainer) return;

  try {
    const snapshot = await getDocs(collection(db, "users"));

    if (snapshot.empty) {
      lbContainer.innerHTML = `<p style="color: var(--text-muted);">لا توجد بيانات في لوحة الشرف حالياً.</p>`;
      return;
    }

    let students = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const studentClass = data.classId || data.grade || "";
      const isStudent = (data.accountType === "student" || !data.accountType) && data.status === "approved";
      
      if (isStudent && studentClass.toString().trim().toLowerCase() === classId.toString().trim().toLowerCase()) {
        students.push(data);
      }
    });

    if (students.length === 0) {
      lbContainer.innerHTML = `<p style="color: var(--text-muted);">لا توجد نقاط مسجلة لمرحلتك حتى الآن.</p>`;
      return;
    }

    students.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));

    let html = `<div style="display: flex; flex-direction: column; gap: 8px;">`;
    let rank = 1;
    
    for (let i = 0; i < Math.min(students.length, 5); i++) {
      if (i > 0 && students[i].points < students[i - 1].points) {
        rank = i + 1;
      }

      const uData = students[i];
      const name = uData.fullName || uData.name || "مخدوم";
      const pts = uData.points || 0;

      let badgeColor = "#7f8c8d";
      if (rank === 1) badgeColor = "#f1c40f"; 
      else if (rank === 2) badgeColor = "#bdc3c7"; 
      else if (rank === 3) badgeColor = "#d35400";

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-bg); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-border);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="background: ${badgeColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${rank}</span>
            <span style="font-weight: 600;">${name}</span>
          </div>
          <span style="font-weight: bold; color: #2ecc71;">${pts} نقطة</span>
        </div>
      `;
    }
    html += `</div>`;
    lbContainer.innerHTML = html;
  } catch (err) {
    console.error("خطأ في تحميل لوحة الشرف للمخدوم:", err);
    lbContainer.innerHTML = `<p style="color: var(--text-muted);">تعذر تحميل لوحة الشرف.</p>`;
  }
}