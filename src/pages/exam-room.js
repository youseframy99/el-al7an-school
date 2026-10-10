import { db, auth } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const examId = urlParams.get('examId');

let currentStudent = null;
let examData = null;

// دالة لتطبيق الإعدادات المخزنة محلياً لهذا المخدوم فقط
function applyUserPreferences() {
  const savedFontSize = localStorage.getItem('user_font_size');
  const savedThemeColor = localStorage.getItem('user_theme_color');

  if (savedFontSize) {
    document.body.style.fontSize = savedFontSize;
  } else {
    document.body.style.fontSize = "";
  }

  if (savedThemeColor === 'dark') {
    document.body.classList.add("dark-mode");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  } else if (savedThemeColor === 'sepia') {
    document.body.classList.remove("dark-mode");
    document.body.style.backgroundColor = "#fbf0d9";
    document.body.style.color = "#5c4033";
  } else if (savedThemeColor === 'light') {
    document.body.classList.remove("dark-mode");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  } else {
    document.body.classList.remove("dark-mode");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyUserPreferences();

  const settingsModal = document.getElementById("settings-modal");
  const settingsOpenBtn = document.getElementById("settings-open-btn");
  const closeSettingsBtn = document.getElementById("close-settings");
  const saveSettingsBtn = document.getElementById("save-settings");
  const resetSettingsBtn = document.getElementById("reset-settings");

  if (settingsOpenBtn && settingsModal) {
    settingsOpenBtn.addEventListener("click", () => {
      settingsModal.style.display = "flex";
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

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

  const themeColorBtns = document.querySelectorAll(".theme-color-btn");
  themeColorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      localStorage.setItem("user_theme_color", theme);
      applyUserPreferences();
    });
  });

  // زر إعادة الضبط للافتراضي (Reset to Default)
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
      localStorage.removeItem("user_font_size");
      localStorage.removeItem("user_theme_color");
      localStorage.removeItem("theme");
      applyUserPreferences();
      settingsModal.style.display = "none";
    });
  }

  if (saveSettingsBtn && settingsModal) {
    saveSettingsBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentStudent = user;
    if (!examId) {
      alert("رقم الامتحان غير مسجل!");
      window.location.href = '/';
      return;
    }
    await loadExamDetails(examId);
  } else {
    window.location.href = '/login';
  }
});

async function loadExamDetails(id) {
  try {
    const resultDocId = `${id}_${currentStudent.uid}`;
    const existingResultSnap = await getDoc(doc(db, "examResults", resultDocId));

    if (existingResultSnap.exists()) {
      document.getElementById("exam-title-header").innerText = "عذراً";
      document.getElementById("exam-desc").innerText = "لقد قمت بتسليم هذا الامتحان من قبل ولا يمكنك إعادته  .";
      document.getElementById("questions-container").innerHTML = `
        <div style="text-align: center; padding: 30px; background: #fff; border-radius: 8px; border: 1px solid var(--color-border);">
          <h3 style="color: #e74c3c; margin-bottom: 10px;">🚫 ممنوع تكرار الامتحان</h3>
          <p style="color: var(--color-text-muted);">تم رصد إجابتك مسبقاً لهذا الاختبار. شكراً لمشاركتك!</p>
          <a href="/" class="btn" style="margin-top: 15px; display: inline-block; padding: 8px 16px; background: var(--color-primary); color: #fff; text-decoration: none; border-radius: 6px;">العودة للرئيسية</a>
        </div>
      `;
      document.getElementById("exam-form").style.display = "none";
      return;
    }

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

  let shuffledQuestions = shuffleArray([...questions]);

  let html = "";
  shuffledQuestions.forEach((q, actualIndex) => {
    const originalIndex = questions.indexOf(q);
    const qText = q.text || q.questionText || "سؤال بدون نص";
    
    html += `<div style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg);">`;
    html += `<p style="font-weight: bold; margin-bottom: 10px;">س${actualIndex + 1}: ${qText} <span style="font-size: 0.8rem; color: var(--color-text-muted);">(${q.score || 1} درجة)</span></p>`;

    if (q.type === "mcq") {
      let allOptions = q.options ? [...q.options] : [];
      if (q.correctAnswer && !allOptions.includes(q.correctAnswer)) {
        allOptions.push(q.correctAnswer);
      }

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
      html += `
        <textarea name="q_${originalIndex}" rows="3" placeholder="اكتب إجابتك هنا..." required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-family: inherit;"></textarea>
      `;
    }
    html += `</div>`;
  });
  container.innerHTML = html;
}

function triggerCelebration() {
  const celebrationAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
  celebrationAudio.volume = 0.8;
  celebrationAudio.play().catch(e => console.log("متصفح الطالب منع تشغيل الصوت تلقائياً:", e));

  if (typeof confetti === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => runFireworks();
    document.head.appendChild(script);
  } else {
    runFireworks();
  }
}

function runFireworks() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 999999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

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

    if (!hasEssay) {
      const currentPoints = Number(studentData.points || studentData.score || 0);
      const newTotalPoints = currentPoints + mcqScore;
      await doc(studentDocRef, {
        points: newTotalPoints
      });
    }

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

    document.getElementById("exam-form").style.display = "none";
    document.getElementById("score-summary").innerText = hasEssay 
      ? `تم تسليم إجاباتك بنجاح! درجة الاختياري المرصودة: ${mcqScore} (في انتظار تصحيح الأسئلة المقالية وإضافة المجموع النهائي)`
      : `درجتك النهائية: ${mcqScore} من الإجمالي`;
    
    document.getElementById("exam-result-box").style.display = "block";

    triggerCelebration();

  } catch (err) {
    console.error("خطأ أثناء تسليم الامتحان:", err);
    alert("حدث خطأ أثناء حفظ الإجابات، برجاء المحاولة مرة أخرى.");
    submitBtn.disabled = false;
    submitBtn.innerText = "تسليم الإجابات وإنهاء الامتحان";
  }
});