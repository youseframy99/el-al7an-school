import { db, auth } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const examId = urlParams.get('examId');

let currentStudent = null;
let examData = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentStudent = user;
    if (!examId) {
      alert("رقم الامتحان غير مسجل!");
      window.location.href = '../../index.html';
      return;
    }
    await loadExamDetails(examId);
  } else {
    window.location.href = '/login';
  }
});

async function loadExamDetails(id) {
  try {
    // 1. الحماية: التحقق هل الطالب قام بتسليم هذا الامتحان من قبل لمنع التكرار وجمع النقاط وهمياً
    const resultDocId = `${id}_${currentStudent.uid}`;
    const existingResultSnap = await getDoc(doc(db, "examResults", resultDocId));

    if (existingResultSnap.exists()) {
      document.getElementById("exam-title-header").innerText = "عذراً";
      document.getElementById("exam-desc").innerText = "لقد قمت بتسليم هذا الامتحان من قبل ولا يمكنك إعادته  .";
      document.getElementById("questions-container").innerHTML = `
        <div style="text-align: center; padding: 30px; background: #fff; border-radius: 8px; border: 1px solid var(--color-border);">
          <h3 style="color: #e74c3c; margin-bottom: 10px;">🚫 ممنوع تكرار الامتحان</h3>
          <p style="color: var(--color-text-muted);">تم رصد إجابتك مسبقاً لهذا الاختبار. شكراً لمشاركتك!</p>
          <a href="../../index.html" class="btn" style="margin-top: 15px; display: inline-block; padding: 8px 16px; background: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px;">العودة للرئيسية</a>
        </div>
      `;
      document.getElementById("exam-form").style.display = "none";
      return;
    }

    // 2. جلب تفاصيل الامتحان لو لم يقم بحله من قبل
    const examDocRef = doc(db, "quizzes", id);
    const snap = await getDoc(examDocRef);

    if (!snap.exists()) {
      document.getElementById("exam-desc").innerText = "عذراً، هذا الامتحان غير موجود.";
      return;
    }

    examData = snap.data();
    document.getElementById("exam-title-header").innerText = examData.title || "امتحان أسبوعي";
    document.getElementById("exam-desc").innerText = examData.description || "أجب عن الأسئلة التالية بكل تأنٍ:";

    renderQuestions(examData.questions || []);
    document.getElementById("exam-intro").style.display = "block";
    document.getElementById("exam-form").style.display = "block";

  } catch (err) {
    console.error("خطأ في جلب تفاصيل الامتحان:", err);
    document.getElementById("exam-desc").innerText = "حدث خطأ أثناء تحميل الامتحان.";
  }
}

// دالة خلط عشوائي (Shuffle) عامة لخلط الأسئلة والخيارات
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function renderQuestions(questions) {
  const container = document.getElementById("questions-container");
  if (!questions || questions.length === 0) {
    container.innerHTML = `<p>لا توجد أسئلة مضافة في هذا الامتحان حالياً.</p>`;
    return;
  }

  // عمل نسخة من الأسئلة وخلطها عشوائياً (Shuffle للأسئلة)
  let shuffledQuestions = shuffleArray([...questions]);

  let html = "";
  shuffledQuestions.forEach((q, actualIndex) => {
    // إيجاد الفهرس الحقيقي للسؤال في المصفوفة الأصلية عشان تصحيح الإجابات يفضل مظبوط 100%
    const originalIndex = questions.indexOf(q);
    const qText = q.text || q.questionText || "سؤال بدون نص";
    
    html += `<div style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg);">`;
    html += `<p style="font-weight: bold; margin-bottom: 10px;">س${actualIndex + 1}: ${qText} <span style="font-size: 0.8rem; color: var(--color-text-muted);">(${q.score || 1} درجة)</span></p>`;

    if (q.type === "mcq") {
      // تجميع الخيارات وضمان وجود الإجابة الصحيحة ضمنها لمنع اختفائها
      let allOptions = q.options ? [...q.options] : [];
      if (q.correctAnswer && !allOptions.includes(q.correctAnswer)) {
        allOptions.push(q.correctAnswer);
      }

      // خلط الاختيارات عشوائياً لكل سؤال (Shuffle للخيارات)
      let shuffledOptions = shuffleArray(allOptions);

      shuffledOptions.forEach((opt) => {
        html += `
          <label style="display: block; margin-bottom: 8px; cursor: pointer;">
            <input type="radio" name="q_${originalIndex}" value="${opt}" required style="margin-left: 8px;">
            ${opt}
          </label>
        `;
      });
    } else {
      // الأسئلة المقالية
      html += `
        <textarea name="q_${originalIndex}" rows="3" placeholder="اكتب إجابتك هنا..." required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-family: inherit;"></textarea>
      `;
    }
    html += `</div>`;
  });
  container.innerHTML = html;
}

// معالجة تسليم الامتحان وحساب درجات الـ MCQ تلقائياً وتحديث نقاط الطالب
document.getElementById("exam-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!examData || !currentStudent) return;

  const submitBtn = document.getElementById("submit-exam-btn");
  submitBtn.disabled = true;
  submitBtn.innerText = "جاري تسليم وحساب الدرجات...";

  try {
    const studentDocRef = doc(db, "users", currentStudent.uid);
    const studentSnap = await getDoc(studentDocRef);
    const studentData = studentSnap.exists() ? studentSnap.data() : {};
    const studentName = studentData.fullName || studentData.name || currentStudent.displayName || "مخدوم";

    let mcqScore = 0;
    let hasEssay = false;
    const studentAnswers = {};
    const questions = examData.questions || [];

    questions.forEach((q, index) => {
      const fieldName = `q_${index}`;
      if (q.type === "mcq") {
        const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
        const selectedVal = selected ? selected.value : ""; 
        studentAnswers[index] = selectedVal;
        
        // التصحيح الآلي بمطابقة النص المختار مع الإجابة الصحيحة المخزنة
        const correctAns = q.correctAnswer || q.correctOption || "";
        if (selectedVal.trim() === correctAns.trim()) {
          mcqScore += (q.score || 1);
        }
      } else {
        hasEssay = true;
        const textVal = document.querySelector(`textarea[name="${fieldName}"]`).value;
        studentAnswers[index] = textVal;
      }
    });

    // 1. تحديث نقاط الطالب في كولكشن users (إضافة نقاط الـ MCQ الحالية لرصيده)
    const currentPoints = Number(studentData.points || studentData.score || 0);
    const newTotalPoints = currentPoints + mcqScore;
    await setDoc(studentDocRef, {
      points: newTotalPoints
    }, { merge: true });

    // 2. حفظ النتيجة في كولكشن examResults
    const resultData = {
      examId: examId,
      examTitle: examData.title || "امتحان أسبوعي",
      studentId: currentStudent.uid,
      studentName: studentName,
      classId: examData.classId || "",
      answers: studentAnswers,
      mcqScore: mcqScore,
      totalScore: mcqScore, 
      fullyGraded: !hasEssay,
      submittedAt: serverTimestamp()
    };

    const resultDocId = `${examId}_${currentStudent.uid}`;
    await setDoc(doc(db, "examResults", resultDocId), resultData);

    // إخفاء النموذج وعرض رسالة النجاح
    document.getElementById("exam-form").style.display = "none";
    document.getElementById("score-summary").innerText = hasEssay 
      ? `درجة الأسئلة الاختيارية المرصودة آلياً: ${mcqScore}`
      : `درجتك النهائية: ${mcqScore} من الإجمالي`;
    
    document.getElementById("exam-result-box").style.display = "block";

  } catch (err) {
    console.error("خطأ أثناء تسليم الامتحان:", err);
    alert("حدث خطأ أثناء حفظ الإجابات، برجاء المحاولة مرة أخرى.");
    submitBtn.disabled = false;
    submitBtn.innerText = "تسليم الإجابات وإنهاء الامتحان";
  }
});