import { db, auth } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
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
  const nameElem = document.getElementById("servant-name-display");
  
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const servantName = userData.fullName || userData.name || user.displayName || "خادم الكنيسة";
        if (nameElem) nameElem.innerText = servantName;

        const classIds = userData.grades || (userData.classId ? [userData.classId] : []);
        
        if (classIds.length > 0) {
          await loadMultipleClassStudents(classIds);
          await loadMultipleLeaderboards(classIds);
          await loadStudentExamGrades(classIds);
          await loadAttendanceHistory(classIds);
        } else {
          const studentsContainer = document.getElementById("students-container");
          if (studentsContainer) studentsContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--text-muted);">لم يتم تحديد فصول لهذا الخادم.</p>`;
          
          const lbContainer = document.getElementById("leaderboard-container");
          if (lbContainer) lbContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted);">لا توجد مراحل مرتبة.</p>`;
        }

      } else {
        if (nameElem) nameElem.innerText = user.displayName || "خادم";
      }
    } catch (e) {
      console.error("خطأ في جلب بيانات الخادم:", e);
      if (nameElem) nameElem.innerText = "خطأ في التحميل";
    }
  } else {
    window.location.href = '/login';
  }
});

// عرض الطلاب لكل مرحلة بدون أزرار حضور
async function loadMultipleClassStudents(classIds) {
  const mainContainer = document.getElementById("students-container");
  if (!mainContainer) return;

  try {
    mainContainer.innerHTML = `<h3 class="section-title"><i class="fa-solid fa-users-rectangle"></i> قائمة مخدومي المراحل والفصول</h3>`;

    const snapshot = await getDocs(collection(db, "users"));
    let allUsers = [];
    snapshot.forEach(docSnap => {
      allUsers.push({ id: docSnap.id, ...docSnap.data() });
    });

    for (const classId of classIds) {
      let stageTitle = `المرحلة / الفصل: ${classId}`;
      let students = allUsers.filter(user => {
        const uClass = user.classId || user.grade || "";
        const isStudent = user.accountType === "student" || !user.accountType;
        return isStudent && uClass.toString().trim().toLowerCase() === classId.toString().trim().toLowerCase();
      });

      let stageBox = document.createElement("div");
      stageBox.style.cssText = "margin-bottom: 25px; background: var(--input-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);";
      
      let headerHtml = `<h4 style="color: #2980b9; margin-bottom: 12px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px;"><i class="fa-solid fa-layer-group"></i> ${stageTitle}</h4>`;

      if (students.length === 0) {
        stageBox.innerHTML = headerHtml + `<p style="color: var(--text-muted); font-size: 0.9rem;">لا يوجد مخدومين مسجلين في هذه المرحلة.</p>`;
        mainContainer.appendChild(stageBox);
        continue;
      }

      let tableHtml = `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
                <th style="padding: 10px;">اسم المخدوم</th>
                <th style="padding: 10px;">رقم الهاتف</th>
                <th style="padding: 10px;">المستوى</th>
                <th style="padding: 10px;">النقاط</th>
              </tr>
            </thead>
            <tbody>
      `;

      for (const student of students) {
        const name = student.fullName || student.name || "طالب بدون اسم";
        const phone = student.phone || student.whatsapp || "غير مسجل";
        const points = student.points || 0;
        const level = student.level || Math.floor(points / 30) + 1;

        tableHtml += `
          <tr style="border-bottom: 1px solid var(--border-color); background: #fff;">
            <td style="padding: 10px; font-weight: 600; color: #333;">${name}</td>
            <td style="padding: 10px; direction: ltr; text-align: right; color: #333;">${phone}</td>
            <td style="padding: 10px; color: #f39c12;"><i class="fa-solid fa-crown"></i> مستوى ${level}</td>
            <td style="padding: 10px; font-weight: bold; color: #27ae60;">${points} نقطة</td>
          </tr>
        `;
      }

      tableHtml += `</tbody></table></div>`;
      stageBox.innerHTML = headerHtml + tableHtml;
      mainContainer.appendChild(stageBox);
    }
  } catch (err) {
    console.error("خطأ في جلب طلاب المراحل:", err);
  }
}

// عرض لوحة الشرف
async function loadMultipleLeaderboards(classIds) {
  const lbContainer = document.getElementById("leaderboard-container");
  if (!lbContainer) return;

  try {
    lbContainer.innerHTML = "";
    const snapshot = await getDocs(collection(db, "users"));
    let allUsers = [];
    snapshot.forEach(docSnap => allUsers.push(docSnap.data()));

    for (const classId of classIds) {
      let stageTitle = `المرحلة / الفصل: ${classId}`;
      let students = allUsers.filter(user => {
        const uClass = user.classId || user.grade || "";
        const isStudent = user.accountType === "student" || !user.accountType;
        return isStudent && uClass.toString().trim().toLowerCase() === classId.toString().trim().toLowerCase();
      });

      students.sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0));

      let stageHtml = `<div style="margin-bottom: 20px; background: var(--input-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);"><h4 style="color: #2980b9; margin-bottom: 10px; border-bottom: 2px solid var(--border-color); padding-bottom: 5px;"><i class="fa-solid fa-layer-group"></i> ${stageTitle}</h4>`;

      if (students.length === 0) {
        stageHtml += `<p style="color: var(--text-muted); font-size: 0.9rem;">لا توجد نقاط مسجلة بعد.</p></div>`;
        lbContainer.innerHTML += stageHtml;
        continue;
      }

      stageHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
      let rank = 1;
      for (let i = 0; i < Math.min(students.length, 5); i++) {
        const student = students[i];
        const name = student.fullName || student.name || "طالب";
        const points = student.points || 0;
        let badgeColor = rank === 1 ? "#f1c40f" : (rank === 2 ? "#bdc3c7" : "#d35400");

        stageHtml += `<div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);"><div style="display: flex; align-items: center; gap: 10px;"><span style="background: ${badgeColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${rank}</span><span style="font-weight: 600; font-size: 0.95rem; color: #333;">${name}</span></div><span style="font-weight: bold; color: #2ecc71; font-size: 0.95rem;">${points} نقطة</span></div>`;
        rank++;
      }
      stageHtml += `</div></div>`;
      lbContainer.innerHTML += stageHtml;
    }
  } catch (err) {
    console.error("خطأ في الليدربورد:", err);
  }
}

// عرض سجلات الحضور السابق
async function loadAttendanceHistory(classIds) {
  const container = document.getElementById("attendance-history-list");
  if (!container) return;

  try {
    const userSnapshot = await getDocs(collection(db, "users"));
    let studentsMap = {};
    userSnapshot.forEach(docSnap => {
      const u = docSnap.data();
      const uClass = u.classId || u.grade || "";
      if (classIds.some(c => c.toString().trim().toLowerCase() === uClass.toString().trim().toLowerCase())) {
        studentsMap[docSnap.id] = u.fullName || u.name || "طالب";
      }
    });

    const attSnapshot = await getDocs(collection(db, "attendance"));
    let historyHtml = "";
    let recordsCount = 0;

    attSnapshot.forEach(docSnap => {
      const att = docSnap.data();
      if (studentsMap[att.studentId]) {
        recordsCount++;
        const statusText = att.status === "present" ? '<span style="color: #27ae60; font-weight: bold;">حاضر ✅</span>' : '<span style="color: #e74c3c; font-weight: bold;">غائب ❌</span>';
        historyHtml += `
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--border-color); background: #fff; border-radius: 4px; margin-bottom: 6px;">
            <span><strong>${studentsMap[att.studentId]}</strong></span>
            <span>التاريخ: ${att.date || "غير محدد"} | الحالة: ${statusText}</span>
          </div>
        `;
      }
    });

    container.innerHTML = recordsCount > 0 ? historyHtml : `<p style="text-align: center; color: var(--text-muted);">لا توجد سجلات حضور سابقة.</p>`;
  } catch (err) {
    console.error("خطأ في تحميل أرشيف الحضور:", err);
    container.innerHTML = `<p style="text-align: center; color: #e74c3c;">تعذر تحميل السجلات.</p>`;
  }
}
// عرض درجات الامتحانات للطلاب في جدول منفصل تماماً
// عرض درجات الامتحانات وتنظيف كافة أخطاء الكلمات
async function loadStudentExamGrades(classIds) {
  const container = document.getElementById("grades-table-wrapper");
  if (!container) return;

  try {
    // 1. جلب الامتحانات من كولكشن quizzes
    const quizzesSnapshot = await getDocs(collection(db, "quizzes"));
    let quizzesMap = {};
    quizzesSnapshot.forEach(docSnap => {
      const qData = docSnap.data();
      quizzesMap[docSnap.id] = qData.title || qData.examName || qData.name || "";
    });

    // 2. جلب الطلاب
    const userSnapshot = await getDocs(collection(db, "users"));
    let studentsMap = {};
    const normalizedClassIds = classIds.map(c => c.toString().trim().toLowerCase());

    userSnapshot.forEach(docSnap => {
      const user = docSnap.data();
      const uClass = (user.classId || user.grade || "").toString().trim().toLowerCase();
      const isStudent = user.accountType === "student" || !user.accountType;
      
      if (isStudent && normalizedClassIds.includes(uClass)) {
        studentsMap[docSnap.id] = {
          name: user.fullName || user.name || "طالب",
          stage: user.grade || user.classId || "غير محدد"
        };
      }
    });

    if (Object.keys(studentsMap).length === 0) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد بيانات طلاب مسجلة في مراحل الخدمة.</p>`;
      return;
    }

    // 3. جلب نتائج الامتحانات
    const resultsSnapshot = await getDocs(collection(db, "examResults"));
    let studentGrades = {};

    resultsSnapshot.forEach(docSnap => {
      const res = docSnap.data();
      
      // فحص محتوى المستند في الـ Console للتأكد من حقل الربط
      console.log("Exam Result Data:", res);

      const studentId = res.studentId || res.userId;
      
      if (studentId && studentsMap[studentId]) {
        // تم تصحيح اسم المتغير تماماً لعدم إعطاء أي خطأ
        if (!studentGrades[studentId]) {
          studentGrades[studentId] = [];
        }
        
        const quizId = res.quizId || res.examId || res.id || res.quiz_id;
        let examTitle = "";

        if (quizId && quizzesMap[quizId]) {
          examTitle = quizzesMap[quizId];
        } else {
          examTitle = res.title || res.quizTitle || res.examName || res.subject || res.name || "";
        }

        if (!examTitle || examTitle.trim() === "") {
          examTitle = "امتحان";
        }

        const score = res.score !== undefined ? res.score : (res.totalScore || 0);
        const maxScore = res.maxScore ? ` / ${res.maxScore}` : "";
        
        studentGrades[studentId].push(`
          <span style="background: #f1f2f6; padding: 5px 10px; border-radius: 6px; display: inline-block; border: 1px solid var(--border-color); font-size: 0.9rem;">
            ${examTitle}: <strong style="color: #27ae60;">${score}${maxScore}</strong>
          </span>
        `);
      }
    });

    let tableHtml = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted);">
              <th style="padding: 12px;">اسم المخدوم</th>
              <th style="padding: 12px;">المرحلة / الفصل</th>
              <th style="padding: 12px;">تفاصيل درجات الامتحانات</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const [studentId, studentInfo] of Object.entries(studentsMap)) {
      const gradesList = studentGrades[studentId] || [];
      const gradesDetails = gradesList.length > 0 ? `<div style="display: flex; flex-wrap: wrap; gap: 6px;">${gradesList.join("")}</div>` : "<span style='color: var(--text-muted);'>لم يتم رصد درجات بعد</span>";

      tableHtml += `
        <tr style="border-bottom: 1px solid var(--border-color); background: #fff;">
          <td style="padding: 12px; font-weight: 600; color: #333;">${studentInfo.name}</td>
          <td style="padding: 12px; color: #2980b9;">${studentInfo.stage}</td>
          <td style="padding: 12px;">${gradesDetails}</td>
        </tr>
      `;
    }

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;

  } catch (err) {
    console.error("خطأ في جلب درجات الامتحانات:", err);
    container.innerHTML = `<p style="text-align: center; color: #e74c3c; padding: 20px;">تعذر تحميل درجات الامتحانات.</p>`;
  }
}