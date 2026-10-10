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
      /* خلفية سماوية بتدرج ناعم وسحب */
      background: linear-gradient(180deg, #5b9bd5 0%, #87ceeb 50%, #b0e0e6 100%);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
      overflow: hidden;
      transition: opacity 0.8s ease;
    }

    /* تأثيرات السحاب المتحرك */
    .church-door-overlay-v3::before,
    .church-door-overlay-v3::after {
      content: '';
      position: absolute;
      width: 200%;
      height: 200%;
      top: -50%;
      left: -50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 10%, transparent 60%);
      animation: cloudMove 25s linear infinite alternate;
      pointer-events: none;
    }
    .church-door-overlay-v3::after {
      animation-duration: 35s;
      animation-direction: alternate-reverse;
      opacity: 0.7;
    }

    @keyframes cloudMove {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(5%, 3%) scale(1.1); }
      100% { transform: translate(-4%, -2%) scale(0.95); }
    }

    .cinematic-door-box {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 70px 30px rgba(212, 175, 55, 0.5), inset 0 0 50px rgba(255, 215, 0, 0.3);
      border-radius: 6px;
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
      /* خلفية ذهبية مزخرفة للأبواب */
      background: linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #7a5800 100%);
      border: 4px solid #fff8dc;
      position: relative;
      box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }

    .door-left-panel::before, .door-right-panel::before {
      content: '☩ ☩ ☩';
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff8dc;
      font-size: 26px;
      letter-spacing: 14px;
      opacity: 0.95;
      text-shadow: 0 0 15px rgba(255, 248, 220, 1);
      writing-mode: vertical-rl;
    }
    
    .handle-left-side, .handle-right-side {
      position: absolute;
      top: 55%;
      width: 12px;
      height: 100px;
      background: #fff8dc;
      border-radius: 6px;
      box-shadow: 0 0 20px rgba(255, 248, 220, 1);
    }
    .handle-left-side { right: 120px; }
    .handle-right-side { left: 120px; }

    /* حاوية الصور على الجانبين */
    .saints-container {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      opacity: 0;
      animation: saintsFadeIn 3s ease forwards 4.5s;
    }

    @keyframes saintsFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .saints-left, .saints-right {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 20px;
      align-items: center;
    }

    .saint-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #fff8dc;
      box-shadow: 0 0 20px rgba(255, 248, 220, 0.8);
      background-size: cover;
      background-position: center;
    }

    .church-door-overlay-v3.open .door-left-panel {
      transform: rotateY(95deg);
      transform-origin: right;
    }
    .church-door-overlay-v3.open .door-right-panel {
      transform: rotateY(-95deg);
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
  
  // إضافة حاوية القديسين
  const saintsContainer = document.createElement("div");
  saintsContainer.className = "saints-container";

  // الجانب الأيسر
  const saintsLeft = document.createElement("div");
  saintsLeft.className = "saints-left";
  saintsLeft.innerHTML = `
    <div class="saint-icon" style="background-image: url('assets/images/saint1.png');"></div>
    <div class="saint-icon" style="background-image: url('assets/images/saint2.png');"></div>
    <div class="saint-icon" style="background-image: url('assets/images/saint3.png');"></div>
  `;

  // الجانب الأيمن
  const saintsRight = document.createElement("div");
  saintsRight.className = "saints-right";
  saintsRight.innerHTML = `
    <div class="saint-icon" style="background-image: url('assets/images/saint4.png');"></div>
    <div class="saint-icon" style="background-image: url('assets/images/saint5.png');"></div>
    <div class="saint-icon" style="background-image: url('assets/images/saint6.png');"></div>
  `;

  saintsContainer.appendChild(saintsLeft);
  saintsContainer.appendChild(saintsRight);
  overlay.appendChild(saintsContainer);

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