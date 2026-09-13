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
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    .church-door-overlay-v3 {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #020202;
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
      overflow: hidden;
      transition: opacity 0.8s ease;
    }
    .cinematic-door-box {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 60px 20px rgba(255, 255, 255, 0.22), inset 0 0 40px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease;
      animation: doorZoomIn 5.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    @keyframes doorZoomIn {
      0% { transform: scale(0.05) translateZ(-3000px); opacity: 0; }
      15% { opacity: 1; }
      90% { transform: scale(1) translateZ(0); opacity: 1; }
      100% { transform: scale(1.02) translateZ(20px); opacity: 1; }
    }
    .door-left-panel, .door-right-panel {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #0d0d0d, #030303);
      border: 4px solid #ffffff;
      position: relative;
      box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    .door-left-panel::before, .door-right-panel::before {
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
    
    /* المقابض ثابتة في النص بدقة (عدل الرقم ده لو حابب تحركها يمين أو شمال) */
    .handle-left-side {
      position: absolute;
      top: 55%;
      right: 120px; 
      width: 10px;
      height: 90px;
      background: #ffffff;
      border-radius: 5px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }
    .handle-right-side {
      position: absolute;
      top: 55%;
      left: 120px; 
      width: 10px;
      height: 90px;
      background: #ffffff;
      border-radius: 5px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    /* حركة صحيحة 100%: البابين بينفتحوا للداخل (كل دِرفة تلف على مفصلاتها الحقيقية في الأطراف لجوة العمق) */
    .church-door-overlay-v3.open .door-left-panel {
      transform: rotateY(110deg);
      transform-origin: right;
    }
    .church-door-overlay-v3.open .door-right-panel {
      transform: rotateY(-110deg);
      transform-origin: left;
    }
    
    .church-door-overlay-v3.fade-out {
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleSheet);

  const overlay = document.createElement("div");
  overlay.className = "church-door-overlay-v3";
  
  const container = document.createElement("div");
  container.className = "cinematic-door-box";

  const doorLeft = document.createElement("div");
  doorLeft.className = "door-left-panel";
  const handleLeft = document.createElement("div");
  handleLeft.className = "handle-left-side";
  doorLeft.appendChild(handleLeft);

  const doorRight = document.createElement("div");
  doorRight.className = "door-right-panel";
  const handleRight = document.createElement("div");
  handleRight.className = "handle-right-side";
  doorRight.appendChild(handleRight);

  container.appendChild(doorLeft);
  container.appendChild(doorRight);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("open");
  }, 5300);

  setTimeout(() => {
    overlay.classList.add("fade-out");
  }, 6200);

  setTimeout(() => {
    overlay.remove();
  }, 7000);
});