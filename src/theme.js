document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  // جلب الثيم المحفوظ أو الافتراضي
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    toggleBtn.textContent = "☀️ ";
  } else {
    document.body.classList.remove("dark-mode");
    toggleBtn.textContent = "🌙 ";
  }

  // عند الضغط على الزرار
  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);

    if (next === "dark") {
      document.body.classList.add("dark-mode");
      toggleBtn.textContent = "☀️ ";
    } else {
      document.body.classList.remove("dark-mode");
      toggleBtn.textContent = "🌙 ";
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // تنظيف أي عنصر قديم لو موجود
  const oldOverlay = document.querySelector(".cinematic-church-overlay");
  if (oldOverlay) oldOverlay.remove();

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    .cinematic-church-overlay {
      position: fixed;
      inset: 0;
      background-color: #000000;
      z-index: 9999999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1600px;
      overflow: hidden;
      transition: opacity 0.8s ease;
    }

    .church-doors-wrapper {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 60px rgba(255, 255, 255, 0.15);
      animation: cameraApproach 5s cubic-bezier(0.15, 0.85, 0.35, 1) forwards;
    }

    @keyframes cameraApproach {
      0% {
        transform: scale(0.05) translateZ(-3500px);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        transform: scale(1) translateZ(0);
        opacity: 1;
      }
    }

    .door-panel-left, .door-panel-right {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a0a, #020202);
      border: 3px solid #ffffff;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 1.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.08);
    }

    /* النقوش والصلبان في منتصف كل درفة */
    .door-panel-left::before, .door-panel-right::before {
      content: '☩ ☩ ☩';
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font-size: 26px;
      letter-spacing: 14px;
      opacity: 0.8;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
      writing-mode: vertical-rl;
    }

    /* المقابض: الدرفة الشمال مقبضها على اليمين (في النص)، الدرفة اليمين مقبضها على الشمال (في النص) */
    .door-panel-left::after {
      content: '';
      position: absolute;
      top: 55%;
      right: 80px;
      width: 10px;
      height: 85px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    .door-panel-right::after {
      content: '';
      position: absolute;
      top: 55%;
      left: 80px;
      width: 10px;
      height: 85px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    /* حركة الدخول للداخل بدقة (مفصلة اليسار ثابتة واليمين تدخل للعمق، والعكس للباب الأيمن) */
    .cinematic-church-overlay.open-portal .door-panel-left {
      transform-origin: left center;
      transform: rotateY(105deg);
    }

    .cinematic-church-overlay.open-portal .door-panel-right {
      transform-origin: right center;
      transform: rotateY(-105deg);
    }

    .cinematic-church-overlay.fade-out-portal {
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleSheet);

  const overlay = document.createElement("div");
  overlay.className = "cinematic-church-overlay";
  
  overlay.innerHTML = `
    <div class="church-doors-wrapper">
      <div class="door-panel-left"></div>
      <div class="door-panel-right"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // التوقيتات: فتح الباب بعد انتهاء حركة الاقتراب (بعد 4.8 ثانية)
  setTimeout(() => {
    overlay.classList.add("open-portal");
  }, 4800);

  // التلاشي بعد اكتمال فتح الأبواب
  setTimeout(() => {
    overlay.classList.add("fade-out-portal");
  }, 5800);

  // الحذف النهائي من الـ DOM
  setTimeout(() => {
    overlay.remove();
  }, 6600);
});