// ==========================================
// لوحة كنترول الخادم - servant-control.js
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات Supabase
const SUPABASE_URL = 'https://rcgbpaoxtiasngpsdqib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rj9pXdXMFUPbMydUtzOcTQ_uFaOxR8T';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// إعدادات فايربيس
const firebaseConfig = {
  apiKey: "AIzaSyC8oBF0wWzLC7kxk7uzR4Wn5pWTC7BZavo",
  authDomain: "el-al7an-school.firebaseapp.com",
  projectId: "el-al7an-school",
  storageBucket: "el-al7an-school.firebasestorage.app",
  messagingSenderId: "1063809387413",
  appId: "1:1063809387413:web:2cd2a2ca849442f9b7c49c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// عناصر واجهة المستخدم
const servantNameDisplay = document.getElementById("servant-name-display");
const errorMsg = document.getElementById("error-msg");
const successMsg = document.getElementById("success-msg");

const attendanceTableBody = document.getElementById("attendance-table-body");
const saveAttendanceBtn = document.getElementById("save-attendance-btn");
const quizGradeInput = document.getElementById("quiz-grade");
const quizSubjectInput = document.getElementById("quiz-subject");
const uploadPdfForm = document.getElementById("upload-pdf-form");
const lessonTitleInput = document.getElementById("lesson-title");
const lessonPdfFileInput = document.getElementById("lesson-pdf-file");
const lessonSubjectInput = document.getElementById("lesson-subject");
const lessonGradeInput = document.getElementById("lesson-grade");
const createQuizForm = document.getElementById("create-quiz-form");
const quizTitleInput = document.getElementById("quiz-title");
const qTextInput = document.getElementById("q-text");
const qTypeSelect = document.getElementById("q-type");
const opt1Input = document.getElementById("opt-1");
const opt2Input = document.getElementById("opt-2");
const opt3Input = document.getElementById("opt-3");
const correctOptInput = document.getElementById("correct-opt");
const addQuestionBtn = document.getElementById("add-question-btn");
const questionsListPreview = document.getElementById("questions-list-preview");

// مصفوفة مؤقتة لتخزين أسئلة الامتحان
let temporaryQuestionsList = JSON.parse(localStorage.getItem("draft_questions")) || [];

// أول ما الصفحة تفتح
document.addEventListener("DOMContentLoaded", () => {
  updateQuestionsPreview();
  loadAdminQuizzes();
  loadEssaysForGrading();
});

// رسائل النجاح والخطأ
function showSuccess(message) {
  if(!successMsg) return;
  successMsg.textContent = message;
  successMsg.classList.remove("hidden");
  if(errorMsg) errorMsg.classList.add("hidden");
  setTimeout(() => successMsg.classList.add("hidden"), 4000);
}

function showError(message) {
  if(!errorMsg) return;
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
  if(successMsg) successMsg.classList.add("hidden");
  setTimeout(() => errorMsg.classList.add("hidden"), 5000);
}

// مراقبة المصادقة
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const servantDocRef = doc(db, "users", user.uid);
      const servantSnap = await getDoc(servantDocRef);

      if (servantSnap.exists()) {
        const servantData = servantSnap.data();
        servantNameDisplay.textContent = `أ / ${servantData.name || servantData.fullName || "خادم الفصل"}`;
      } else {
        servantNameDisplay.textContent = "خادم النظام";
      }

      await loadStudentsForAttendance();
      await loadUploadedLessons();

    } catch (error) {
      console.error("خطأ في جلب بيانات الخادم:", error);
      showError("حدث خطأ أثناء تحميل بيانات الكنترول.");
    }
  } else {
    window.location.href = "../index.html";
  }
});

// 1. الحضور والغياب (متوافق مع الكود الأصلي الخاص بك)
// ==========================================
// دالة تسجيل وحفظ الحضور (محدثة لمنع التكرار وزيادة 5 نقاط)
// ==========================================
async function loadStudentsForAttendance() {
  if (!attendanceTableBody) return;
  try {
    attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center">جاري تحميل قائمة الطلاب...</td></tr>`;
    
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    if (usersSnapshot.empty) {
      attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center">لا توجد بيانات مسجلة.</td></tr>`;
      return;
    }

    attendanceTableBody.innerHTML = "";
    let count = 0;
    let seenNames = new Set();

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const studentName = (userData.name || userData.fullName || "طالب").trim();

      // فحص كل احتمالات الحقل اللي بيحدد نوع الحساب (accountType أو role أو type)
      const userType = (userData.accountType || userData.role || userData.type || "").toLowerCase();
      
      // لو الحساب خادم بأي شكل، اهمله فوراً
      if (userType === "servant") {
        return;
      }

      // منع تكرار الأسماء
      if (seenNames.has(studentName)) {
        return;
      }
      seenNames.add(studentName);

      count++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${studentName}</td>
        <td class="text-center">
          <input type="checkbox" class="attendance-checkbox" data-id="${userId}" style="width: 20px; height: 20px; cursor: pointer;">
        </td>
      `;
      attendanceTableBody.appendChild(row);
    });

    if (count === 0) {
      attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center">لا يوجد طلاب مضافين.</td></tr>`;
    }

  } catch (error) {
    console.error("خطأ في تحميل الطلاب:", error);
    attendanceTableBody.innerHTML = `<tr><td colspan="2" class="text-center" style="color: #e74c3c;">فشل تحميل قائمة الطلاب.</td></tr>`;
  }
}

// زر حفظ الحضور وتحديث النقاط (تأكد إنه موجود عندك أو استبدله بهذا)
if (saveAttendanceBtn) {
  saveAttendanceBtn.addEventListener("click", async () => {
    try {
      const checkboxes = document.querySelectorAll(".attendance-checkbox");
      const todayDate = new Date().toISOString().split('T')[0];

      let count = 0;
      for (const cb of checkboxes) {
        const studentId = cb.getAttribute("data-id");
        const isPresent = cb.checked;

        const attendanceRef = doc(db, "students", studentId, "attendance", todayDate);
        await setDoc(attendanceRef, {
          date: todayDate,
          present: isPresent,
          timestamp: serverTimestamp()
        });

        if (isPresent) {
          const studentDocRef = doc(db, "users", studentId);
          const studentSnap = await getDoc(studentDocRef);
          
          if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            const currentPoints = Number(studentData.points || studentData.score || 0);
            
            await updateDoc(studentDocRef, {
              points: currentPoints + 5
            });
          }
        }
        
        count++;
      }

      showSuccess(`تم حفظ الحضور لـ ${count} طالب، وتمت إضافة 5 نقاط للحاضرين بنجاح! 🌟`);
    } catch (error) {
      console.error("خطأ في حفظ الحضور أو النقاط:", error);
      showError("فشل حفظ الحضور، حاول مرة أخرى.");
    }
  });
}

// 2. رفع ملفات الـ PDF
if (uploadPdfForm) {
  uploadPdfForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = lessonTitleInput.value.trim();
    const grade = lessonGradeInput.value;
    const subject = lessonSubjectInput.value;
    const file = lessonPdfFileInput.files[0];

    if (!file) {
      showError("الرجاء اختيار ملف PDF.");
      return;
    }

    if (!grade || !subject) {
      showError("الرجاء اختيار المرحلة الدراسية والمادة معاً.");
      return;
    }

    try {
      showSuccess("جاري رفع الملف، يرجى الانتظار...");
      
      const fileName = `lessons_pdf/${Date.now()}_${file.name}`;
      const { data, error } = await supabaseClient.storage
        .from('lessons-pdf')
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      const { data: publicURLData } = supabaseClient.storage
        .from('lessons-pdf')
        .getPublicUrl(fileName);

      const downloadUrl = publicURLData.publicUrl;

      await addDoc(collection(db, "lessons"), {
        title: title,
        grade: grade,
        subject: subject,
        pdfUrl: downloadUrl,
        filePath: fileName,
        createdAt: serverTimestamp()
      });

      showSuccess("تم رفع ونشر المنهج للمرحلة والمادة المحددة بنجاح! 📚✨");
      uploadPdfForm.reset();
      await loadUploadedLessons();
    } catch (error) {
      console.error("خطأ في رفع ملف الـ PDF:", error);
      showError("حدث خطأ أثناء رفع الملف: " + error.message);
    }
  });
}

// 3. إدارة الأسئلة والامتحانات
if (addQuestionBtn) {
  addQuestionBtn.addEventListener("click", () => {
    const qText = qTextInput.value.trim();
    const qType = qTypeSelect.value;

    if (!qText) {
      showError("الرجاء كتابة نص السؤال أولاً.");
      return;
    }

    let questionObj = { text: qText, type: qType };

    if (qType === "mcq") {
      const opt1 = opt1Input.value.trim();
      const opt2 = opt2Input.value.trim();
      const opt3 = opt3Input.value.trim();
      const correctOpt = correctOptInput.value.trim();

      if (!opt1 || !opt2 || !correctOpt) {
        showError("أسئلة الاختيار من متعدد تتطلب اختيارين على الأقل وتحديد الإجابة الصحيحة.");
        return;
      }

      questionObj.options = [opt1, opt2, opt3].filter(Boolean);
      questionObj.correctAnswer = correctOpt;
    }

    temporaryQuestionsList.push(questionObj);
    updateQuestionsPreview();

    qTextInput.value = "";
    opt1Input.value = "";
    opt2Input.value = "";
    opt3Input.value = "";
    correctOptInput.value = "";
    showSuccess("تمت إضافة السؤال للقائمة بنجاح.");
  });
}

function updateQuestionsPreview() {
  if(!questionsListPreview) return;
  localStorage.setItem("draft_questions", JSON.stringify(temporaryQuestionsList));

  if (temporaryQuestionsList.length === 0) {
    questionsListPreview.innerHTML = `<li>لم يتم إضافة أسئلة بعد...</li>`;
    return;
  }

  questionsListPreview.innerHTML = "";
  temporaryQuestionsList.forEach((q, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "5px";
    
    li.innerHTML = `
      <span>س${index + 1}: ${q.text} (${q.type === 'mcq' ? 'اختياري' : 'مقالي'})</span>
      <button type="button" onclick="window.deleteDraftQuestion(${index})" style="background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">حذف</button>
    `;
    questionsListPreview.appendChild(li);
  });
}

window.deleteDraftQuestion = function(index) {
  temporaryQuestionsList.splice(index, 1);
  updateQuestionsPreview();
  showSuccess("تم حذف السؤال من المسودة.");
};

if (createQuizForm) {
  createQuizForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const quizTitle = quizTitleInput.value.trim();
    const quizGrade = quizGradeInput.value;
    const quizSubject = quizSubjectInput.value;

    if (!quizGrade || !quizSubject) {
      showError("الرجاء اختيار المرحلة الدراسية والمادة للامتحان.");
      return;
    }

    if (temporaryQuestionsList.length === 0) {
      showError("يجب إضافة سؤال واحد على الأقل لنشر الامتحان.");
      return;
    }

    try {
      await addDoc(collection(db, "quizzes"), {
        title: quizTitle,
        grade: quizGrade,
        subject: quizSubject,
        questions: temporaryQuestionsList,
        createdAt: serverTimestamp()
      });

      showSuccess("تم حفظ ونشر الامتحان الأسبوعي للمرحلة والمادة المحددة بنجاح! 📝✨");
      createQuizForm.reset();
      
      temporaryQuestionsList = [];
      localStorage.removeItem("draft_questions");
      updateQuestionsPreview();
      loadAdminQuizzes();

    } catch (error) {
      console.error("خطأ في نشر الامتحان:", error);
      showError("حدث خطأ أثناء حفظ الامتحان.");
    }
  });
}

if (qTypeSelect) {
  qTypeSelect.addEventListener("change", (e) => {
    const selectedType = e.target.value;
    const optFields = [opt1Input, opt2Input, opt3Input, correctOptInput];
    
    if (selectedType === "essay") {
      optFields.forEach(input => {
        if (input && input.parentElement) input.parentElement.style.display = "none";
      });
    } else {
      optFields.forEach(input => {
        if (input && input.parentElement) input.parentElement.style.display = "block";
      });
    }
  });
}

// 4. جلب وعرض الدروس والملفات المرفوعة
async function loadUploadedLessons() {
  const lessonsTableBody = document.getElementById("lessons-table-body");
  if (!lessonsTableBody) return;

  try {
    lessonsTableBody.innerHTML = `<tr><td colspan="4" class="text-center">جاري تحميل الملفات...</td></tr>`;
    
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    if (lessonsSnapshot.empty) {
      lessonsTableBody.innerHTML = `<tr><td colspan="4" class="text-center">لا توجد ملفات مرفوعة حالياً.</td></tr>`;
      return;
    }

    lessonsTableBody.innerHTML = "";
    lessonsSnapshot.forEach((docSnap) => {
      const lesson = docSnap.data();
      const lessonId = docSnap.id;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="padding: 10px;">${lesson.title || "بدون عنوان"}</td>
        <td style="padding: 10px;">${lesson.grade || "-"}</td>
        <td style="padding: 10px;">${lesson.subject || "-"}</td>
        <td class="text-center" style="padding: 10px;">
          <a href="${lesson.pdfUrl}" target="_blank" class="btn btn-sm btn-primary" style="margin-left: 5px; text-decoration: none; padding: 4px 8px; background: #3498db; color: white; border-radius: 4px;">عرض PDF</a>
          <button type="button" onclick="window.deleteLesson('${lessonId}', '${lesson.filePath || ''}')" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">حذف</button>
        </td>
      `;
      lessonsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("خطأ في تحميل جدول الدروس:", error);
    lessonsTableBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: #e74c3c;">فشل تحميل قائمة الدروس.</td></tr>`;
  }
}

window.deleteLesson = async function(lessonId, filePath) {
  if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الدرس؟")) return;

  try {
    await deleteDoc(doc(db, "lessons", lessonId));
    if (filePath) {
      await supabaseClient.storage.from('lessons-pdf').remove([filePath]);
    }
    showSuccess("تم حذف الدرس والملف بنجاح! 🗑️");
    await loadUploadedLessons();
  } catch (error) {
    console.error("خطأ أثناء الحذف:", error);
    showError("حدث خطأ أثناء حذف الدرس: " + error.message);
  }
};

// 5. إدارة الامتحانات الحالية
async function loadAdminQuizzes() {
  const container = document.getElementById("admin-quizzes-list");
  if (!container) return;

  try {
    container.innerHTML = "<p>جاري التحميل...</p>";
    const querySnapshot = await getDocs(collection(db, "quizzes"));
    
    if (querySnapshot.empty) {
      container.innerHTML = "<p>لا توجد امتحانات مضافة حالياً.</p>";
      return;
    }

    container.innerHTML = "";
    querySnapshot.forEach((docSnap) => {
      const quiz = docSnap.data();
      const quizId = docSnap.id;

      const quizCard = document.createElement("div");
      quizCard.className = "admin-quiz-card";
      quizCard.style.cssText = "display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); padding: 12px; margin-bottom: 10px; border-radius: 6px; background: #fff;";
      quizCard.innerHTML = `
        <div class="quiz-info">
          <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${quiz.title}</h4>
          <p style="margin: 0; font-size: 0.85rem; color: #666;">المرحلة: ${quiz.grade} | المادة: ${quiz.subject} | عدد الأسئلة: ${quiz.questions ? quiz.questions.length : 0}</p>
        </div>
        <div class="quiz-actions" style="display: flex; gap: 5px;">
          <button class="btn-edit" onclick="window.editQuiz('${quizId}')" style="background: #f39c12; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✏️ تعديل</button>
          <button class="btn-delete" onclick="window.deleteQuiz('${quizId}')" style="background: #e74c3c; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️ حذف</button>
        </div>
      `;
      container.appendChild(quizCard);
    });
  } catch (error) {
    console.error("خطأ في جلب الامتحانات:", error);
    container.innerHTML = "<p>حدث خطأ أثناء تحميل الامتحانات.</p>";
  }
}

window.deleteQuiz = async function(quizId) {
  if (confirm("هل أنت متأكد من حذف هذا الامتحان نهائياً؟")) {
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
      showSuccess("تم حذف الامتحان بنجاح!");
      loadAdminQuizzes();
    } catch (error) {
      console.error("خطأ في حذف الامتحان:", error);
      showError("فشل حذف الامتحان.");
    }
  }
};

window.editQuiz = async function(quizId) {
  try {
    const quizDoc = await getDoc(doc(db, "quizzes", quizId));
    if (quizDoc.exists()) {
      const quizData = quizDoc.data();
      
      quizTitleInput.value = quizData.title;
      quizGradeInput.value = quizData.grade;
      quizSubjectInput.value = quizData.subject;
      
      temporaryQuestionsList = quizData.questions || [];
      updateQuestionsPreview();

      showSuccess("تم سحب بيانات الامتحان للفورم، يمكنك التعديل والضغط على نشر لتحديثه!");
      
      await deleteDoc(doc(db, "quizzes", quizId));
      loadAdminQuizzes();
    }
  } catch (error) {
    console.error("خطأ في تعديل الامتحان:", error);
  }
};

// ==========================================
// 7. نظام تصحيح الأسئلة المقالية للكنترول
// ==========================================
async function loadEssaysForGrading() {
  const container = document.getElementById("essays-to-grade-container");
  if (!container) return;

  try {
    container.innerHTML = "<p>جاري فحص الإجابات المقالية بانتظار التصحيح...</p>";
    
    const resultsSnapshot = await getDocs(collection(db, "examResults"));
    
    let html = "";
    let pendingCount = 0;

    for (const docSnap of resultsSnapshot.docs) {
      const result = docSnap.data();
      const resultId = docSnap.id;

      if (result.fullyGraded === false || (result.fullyGraded === undefined && result.answers)) {
        
        const quizDocRef = doc(db, "quizzes", result.examId);
        const quizSnap = await getDoc(quizDocRef);
        
        if (!quizSnap.exists()) continue;
        const quizData = quizSnap.data();
        const questions = quizData.questions || [];

        const hasEssayQuestions = questions.some(q => q.type === "essay");
        if (!hasEssayQuestions) continue;

        pendingCount++;
        html += `
          <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-bottom: 15px; background: #fff;">
            <h4 style="color: #2c3e50; margin-bottom: 5px;">امتحان: ${result.examTitle || 'بدون عنوان'}</h4>
            <p style="font-size: 0.9rem; color: #666;">اسم المخدوم: <strong>${result.studentName || 'طالب'}</strong></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
        `;

        questions.forEach((q, qIndex) => {
          if (q.type === "essay") {
            const studentAnswer = (result.answers && result.answers[qIndex]) !== undefined ? result.answers[qIndex] : "لم يقدم إجابة";
            const currentEssayScore = (result.essayScores && result.essayScores[qIndex]) !== undefined ? result.essayScores[qIndex] : 0;

            html += `
              <div style="margin-bottom: 12px; background: #f9f9f9; padding: 10px; border-radius: 6px;">
                <p><strong>س (${q.text || 'سؤال مقالي'}):</strong></p>
                <p style="color: #444; font-style: italic; margin: 5px 0;">إجابة المخدوم: ${studentAnswer}</p>
                <label style="font-size: 0.85rem; font-weight: bold;">منح درجة (من 1):</label>
                <input type="number" min="0" max="1" value="${currentEssayScore}" id="score_${resultId}_${qIndex}" style="width: 80px; padding: 4px; margin-right: 10px; border-radius: 4px; border: 1px solid #ccc;">
              </div>
            `;
          }
        });

        html += `
            <button type="button" onclick="window.saveEssayGrades('${resultId}', '${result.studentId}', ${result.mcqScore || 0})" style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 5px; font-weight: bold;">
              💾 حفظ درجة المقالي وتحديث النتيجة
            </button>
          </div>
        `;
      }
    }

    if (pendingCount === 0) {
      container.innerHTML = `<p style="color: #777;">لا توجد إجابات مقالية بانتظار التصحيح حالياً.</p>`;
    } else {
      container.innerHTML = html;
    }

  } catch (err) {
    console.error("خطأ في تحميل المقالات للتصحيح:", err);
    container.innerHTML = `<p style="color: red;">حدث خطأ أثناء تحميل بيانات التصحيح.</p>`;
  }
}

window.saveEssayGrades = async function(resultId, studentId, mcqScore) {
  try {
    const resultRef = doc(db, "examResults", resultId);
    const resultSnap = await getDoc(resultRef);
    if (!resultSnap.exists()) return;
    const resultData = resultSnap.data();

    const quizDoc = await getDoc(doc(db, "quizzes", resultData.examId));
    if (!quizDoc.exists()) return;
    const quizData = quizDoc.data();
    const questions = quizData.questions || [];

    let totalEssayScore = 0;
    const essayScoresMap = {};

    questions.forEach((q, qIndex) => {
      if (q.type === "essay") {
        const inputElem = document.getElementById(`score_${resultId}_${qIndex}`);
        const assignedScore = inputElem ? parseFloat(inputElem.value) || 0 : 0;
        essayScoresMap[qIndex] = assignedScore;
        totalEssayScore += assignedScore;
      }
    });

    const finalTotalScore = Number(mcqScore) + Number(totalEssayScore);

    await updateDoc(resultRef, {
      essayScores: essayScoresMap,
      essayScore: totalEssayScore,
      totalScore: finalTotalScore,
      fullyGraded: true,
      gradedAt: serverTimestamp()
    });

    if (studentId) {
      const studentRef = doc(db, "users", studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const currentPoints = Number(studentData.points || studentData.score || 0);
        await updateDoc(studentRef, {
          points: currentPoints + finalTotalScore
        });
      }
    }

    alert("تم حفظ درجات المقالي وتحديث نقاط المخدوم بنجاح! 🏆✨");
    loadEssaysForGrading();

  } catch (err) {
    console.error("خطأ أثناء حفظ درجات المقالي:", err);
    alert("حدث خطأ أثناء الحفظ، حاول مرة أخرى.");
  }
};