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
      /* خلفية سماوية هادئة مع سحاب */
      background: linear-gradient(180deg, #5b9bd5 0%, #87ceeb 50%, #b0e0e6 100%);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
      overflow: hidden;
      transition: opacity 1.2s ease;
    }

    /* تأثيرات السحاب المتحرك ببطء */
    .church-door-overlay-v3::before,
    .church-door-overlay-v3::after {
      content: '';
      position: absolute;
      width: 200%;
      height: 200%;
      top: -50%;
      left: -50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.45) 10%, transparent 60%);
      animation: cloudMove 35s linear infinite alternate;
      pointer-events: none;
    }
    .church-door-overlay-v3::after {
      animation-duration: 45s;
      animation-direction: alternate-reverse;
      opacity: 0.7;
    }

    @keyframes cloudMove {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(4%, 2%) scale(1.08); }
      100% { transform: translate(-3%, -2%) scale(0.95); }
    }

    /* حاوية القديسين مع أنيمشن ظهور هادئ وتدريجي */
    .saints-container {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
      pointer-events: none;
      opacity: 0;
      animation: saintsFadeIn 2.5s ease-out forwards 0.4s;
      z-index: 2;
    }

    @keyframes saintsFadeIn {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* مجموعات القديسين فوق بعضها (شكل عمودي) */
    .saints-group-left, .saints-group-right {
      display: flex;
      flex-direction: column;
      gap: 15px;
      justify-content: center;
      align-items: center;
    }

    /* تكبير حجم الأيقونات لتكون واضحة وفخمة */
    .saint-figure {
      width: 140px;
      height: 160px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      filter: drop-shadow(0 0 20px rgba(255, 248, 220, 0.9));
      transition: transform 0.5s ease;
    }

    .cinematic-door-box {
      width: 360px;
      height: 540px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 70px 30px rgba(212, 175, 55, 0.5), inset 0 0 50px rgba(255, 215, 0, 0.3);
      border-radius: 6px;
      transition: transform 2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease;
      animation: doorZoomIn 8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      z-index: 3;
    }

    @keyframes doorZoomIn {
      0% { transform: scale(0.05) translateZ(-3500px); opacity: 0; }
      20% { opacity: 1; }
      90% { transform: scale(1) translateZ(0); opacity: 1; }
      100% { transform: scale(1.02) translateZ(20px); opacity: 1; }
    }

    .door-left-panel, .door-right-panel {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #7a5800 100%);
      border: 4px solid #fff8dc;
      position: relative;
      box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
      transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1);
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
    .handle-left-side { right: 110px; }
    .handle-right-side { left: 110px; }

    /* حركة فتح البابين للداخل ببطء وفخامة */
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
  
  // حاوية الـ 6 قديسين
  const saintsContainer = document.createElement("div");
  saintsContainer.className = "saints-container";

  // المجموعة اليسرى (3 قديسين فوق بعض)
  const leftGroup = document.createElement("div");
  leftGroup.className = "saints-group-left";
  leftGroup.innerHTML = `
    <div class="saint-figure" style="background-image: url('assets/images/saint1.png');"></div>
    <div class="saint-figure" style="background-image: url('assets/images/saint2.png');"></div>
    <div class="saint-figure" style="background-image: url('assets/images/saint3.png');"></div>
  `;

  // المجموعة اليمنى (3 قديسين فوق بعض)
  const rightGroup = document.createElement("div");
  rightGroup.className = "saints-group-right";
  rightGroup.innerHTML = `
    <div class="saint-figure" style="background-image: url('assets/images/saint4.png');"></div>
    <div class="saint-figure" style="background-image: url('assets/images/saint5.png');"></div>
    <div class="saint-figure" style="background-image: url('assets/images/saint6.png');"></div>
  `;

  saintsContainer.appendChild(leftGroup);
  saintsContainer.appendChild(rightGroup);
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
  }, 7500);

  setTimeout(() => {
    overlay.classList.add("fade-out");
  }, 9500);

  setTimeout(() => {
    overlay.remove();
  }, 10700);
});