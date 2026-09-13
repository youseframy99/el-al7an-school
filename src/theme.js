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
  // إنشاء طبقة الظلام والغرفة المظلمة والباب الأثري
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="cinematic-door-container">
      <div class="door-left"></div>
      <div class="door-right"></div>
    </div>
  `;
  document.body.appendChild(doorOverlay);

  // بعد 2.2 ثانية (لما الكاميرا تقرب وتوصل للباب)، ابدأ افتح البابين
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 2200);

  // بعد ما الباب يفتح ويتشلع، نعمل Fade out للظلام عشان تظهر صفحة الدخول بوضوح
  setTimeout(() => {
    doorOverlay.classList.add("fade-out");
  }, 3200);

  // مسح العنصر تماماً من الـ DOM بعد انتهاء المشهد عشان الثيم والزرار يشتغلوا بحرية تامة
  setTimeout(() => {
    doorOverlay.remove();
  }, 3800);
});