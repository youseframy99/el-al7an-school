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
  // 1. الحقن بـ CSS نظيف ومضمون 100% بعيد عن ملفات الكاش
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    .church-door-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #020202;
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1500px;
      overflow: hidden;
      transition: opacity 0.8s ease;
    }
    .cinematic-door-container {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 60px 20px rgba(255, 255, 255, 0.22), inset 0 0 40px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      animation: approachDoorSlow 5.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    @keyframes approachDoorSlow {
      0% { transform: scale(0.05) translateZ(-3000px); opacity: 0; }
      15% { opacity: 1; }
      90% { transform: scale(1) translateZ(0); opacity: 1; }
      100% { transform: scale(1.02) translateZ(20px); opacity: 1; }
    }
    .door-left, .door-right {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #0d0d0d, #030303);
      border: 4px solid #ffffff;
      position: relative;
      box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
      transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1);
      transform-style: preserve-3d;
    }
    .door-left::before, .door-right::before {
      content: '☩ ☩ ☩';
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font-size: 26px;
      letter-spacing: 14px;
      opacity: 0.85;
      text-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
      writing-mode: vertical-rl;
    }
    /* المقابض في المنتصف تماماً وبكل إصرار وعناد */
    .door-left::after {
      content: '';
      position: absolute;
      top: 55%;
      right: 12px;
      width: 10px;
      height: 90px;
      background: #ffffff;
      border-radius: 5px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }
    .door-right::after {
      content: '';
      position: absolute;
      top: 55%;
      left: 12px;
      width: 10px;
      height: 90px;
      background: #ffffff;
      border-radius: 5px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }
    .church-door-overlay.open .door-left {
      transform: rotateY(-110deg);
      transform-origin: left;
    }
    .church-door-overlay.open .door-right {
      transform: rotateY(110deg);
      transform-origin: right;
    }
    .church-door-overlay.fade-out {
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleSheet);

  // 2. إنشاء الهيكل في الـ DOM
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="cinematic-door-container">
      <div class="door-left"></div>
      <div class="door-right"></div>
    </div>
  `;
  document.body.appendChild(doorOverlay);

  // 3. التوقيتات للفتح والتلاشي
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 5300);

  setTimeout(() => {
    doorOverlay.classList.add("fade-out");
  }, 6200);

  setTimeout(() => {
    doorOverlay.remove();
  }, 7000);
});