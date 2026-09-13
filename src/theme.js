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
  // بناء الباب ليغطي الشاشة بالكامل من لحظة التحميل
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="cinematic-door-container">
      <div class="door-left"></div>
      <div class="door-right"></div>
    </div>
  `;
  document.body.appendChild(doorOverlay);

  // أول ما الصفحة تفتح (زي ومضة الموبايل)، الباب يبدأ يفتح فوراً بانسياق فخم
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 300);

  // عمل تداخل وتلاشي للطبقة بعد اكتمال الفتح
  setTimeout(() => {
    doorOverlay.classList.add("fade-out");
  }, 1600);

  // إزالة العنصر نهائياً عشان زرار الثيم يشتغل بكل راحة
  setTimeout(() => {
    doorOverlay.remove();
  }, 2300);
});