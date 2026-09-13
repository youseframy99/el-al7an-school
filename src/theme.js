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
  // 1. إنشاء طبقة الظلام والباب بالكامل مباشرة من الـ JS
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vw;
    background-color: #020202;
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1500px;
    overflow: hidden;
    transition: opacity 0.8s ease;
  `;

  const container = document.createElement("div");
  container.style.cssText = `
    width: 380px;
    height: 580px;
    display: flex;
    position: relative;
    box-shadow: 0 0 60px 20px rgba(255, 255, 255, 0.22), inset 0 0 40px rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    transform: scale(0.05) translateZ(-3000px);
    opacity: 0;
    transition: transform 5.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease;
  `;

  // درفة الباب اليسار
  const doorLeft = document.createElement("div");
  doorLeft.style.cssText = `
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, #0d0d0d, #030303);
    border: 4px solid #ffffff;
    position: relative;
    box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
  `;
  // مقبض اليسار على اليمين (في المنتصف)
  const handleLeft = document.createElement("div");
  handleLeft.style.cssText = `
    position: absolute;
    top: 55%;
    right: 12px;
    width: 10px;
    height: 90px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  `;
  doorLeft.appendChild(handleLeft);

  // درفة الباب اليمين
  const doorRight = document.createElement("div");
  doorRight.style.cssText = `
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, #0d0d0d, #030303);
    border: 4px solid #ffffff;
    position: relative;
    box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.1);
  `;
  // مقبض اليمين على اليسار (في المنتصف)
  const handleRight = document.createElement("div");
  handleRight.style.cssText = `
    position: absolute;
    top: 55%;
    left: 12px;
    width: 10px;
    height: 90px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
  `;
  doorRight.appendChild(handleRight);

  container.appendChild(doorLeft);
  container.appendChild(doorRight);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // 2. بدء الاقتراب البطيء فوراً بعد التحميل
  setTimeout(() => {
    container.style.transform = "scale(1) translateZ(0)";
    container.style.opacity = "1";
  }, 100);

  // 3. بعد 5.5 ثانية (لما الاقتراب يخلص)، الباب هيتزق لجوة ويدخل في العمق
  setTimeout(() => {
    container.style.transition = "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.9s ease";
    container.style.transform = "scale(3.5) translateZ(800px)";
    overlay.style.opacity = "0";
  }, 5600);

  // 4. إزالة العنصر نهائياً من الصفحة
  setTimeout(() => {
    overlay.remove();
  }, 6800);
});