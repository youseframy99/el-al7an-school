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
      overflow: hidden;
      transition: opacity 0.8s ease;
    }

    .church-doors-wrapper {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      box-shadow: 0 0 60px rgba(255, 255, 255, 0.15);
      animation: cameraApproach 5s cubic-bezier(0.15, 0.85, 0.35, 1) forwards;
    }

    @keyframes cameraApproach {
      0% { transform: scale(0.05); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    .door-panel-left, .door-panel-right {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a0a, #020202);
      border: 3px solid #ffffff;
      position: relative;
      transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1);
      box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.08);
    }

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

    /* المقابض في المنتصف تماماً */
    .door-panel-left::after {
      content: '';
      position: absolute;
      top: 55%;
      right: 12px;
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
      left: 12px;
      width: 10px;
      height: 85px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    /* فتح حقيقي ونظيف: الدرفة الشمال تزحف أقصى الشمال، واليمين تزحف أقصى اليمين من غير أي لفة أو هبل */
    .cinematic-church-overlay.open-portal .door-panel-left {
      transform: translateX(-100%);
    }

    .cinematic-church-overlay.open-portal .door-panel-right {
      transform: translateX(100%);
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

  setTimeout(() => {
    overlay.classList.add("open-portal");
  }, 4800);

  setTimeout(() => {
    overlay.classList.add("fade-out-portal");
  }, 5800);

  setTimeout(() => {
    overlay.remove();
  }, 6600);
});