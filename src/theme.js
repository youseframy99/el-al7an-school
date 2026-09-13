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
  const existingOverlay = document.getElementById("church-door-active-overlay");
  if (existingOverlay) existingOverlay.remove();

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerHTML = `
    #church-door-active-overlay {
      position: fixed;
      inset: 0;
      background-color: #000000;
      z-index: 9999999;
      display: flex;
      justify-content: center;
      align-items: center;
      perspective: 1200px;
      overflow: hidden;
      transition: opacity 0.8s ease;
    }

    .church-portal-frame {
      width: 380px;
      height: 580px;
      display: flex;
      position: relative;
      transform-style: preserve-3d;
      box-shadow: 0 0 70px rgba(255, 255, 255, 0.2);
      animation: smoothCameraApproach 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes smoothCameraApproach {
      0% { transform: scale(0.08) translateZ(-2500px); opacity: 0; }
      100% { transform: scale(1) translateZ(0); opacity: 1; }
    }

    .door-leaf {
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, #0f0f0f, #020202);
      border: 3px solid #ffffff;
      position: relative;
      transform-style: preserve-3d;
      backface-visibility: hidden;
      transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
      box-shadow: inset 0 0 45px rgba(255, 255, 255, 0.08);
    }

    /* النقوش */
    .door-leaf::before {
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

    /* المقابض: تم تعديل الموضع إلى 90px بناءً على طلبك */
    .door-handle {
      position: absolute;
      top: 55%;
      width: 10px;
      height: 85px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
      transform: translateZ(2px);
    }

    .door-leaf-left .door-handle { right: 90px; }
    .door-leaf-right .door-handle { left: 90px; }

    /* مفصلات الأبواب */
    .door-leaf-left { transform-origin: left center; }
    .door-leaf-right { transform-origin: right center; }

    /* الدوران للداخل (Push-In) بعيداً عن الشاشة */
    #church-door-active-overlay.door-is-open .door-leaf-left {
      transform: rotateY(95deg);  /* موجب = دخول لداخل الشاشة */
    }

    #church-door-active-overlay.door-is-open .door-leaf-right {
      transform: rotateY(-95deg); /* سالب = دخول لداخل الشاشة */
    }

    #church-door-active-overlay.fade-out-portal {
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleSheet);

  const overlay = document.createElement("div");
  overlay.id = "church-door-active-overlay";
  
  overlay.innerHTML = `
    <div class="church-portal-frame">
      <div class="door-leaf door-leaf-left">
        <div class="door-handle"></div>
      </div>
      <div class="door-leaf door-leaf-right">
        <div class="door-handle"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("door-is-open");
  }, 3000);

  setTimeout(() => {
    overlay.classList.add("fade-out-portal");
  }, 4300);

  setTimeout(() => {
    overlay.remove();
  }, 5200);
});