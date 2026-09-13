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
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="cinematic-door-container">
      <div class="door-left"></div>
      <div class="door-right"></div>
    </div>
  `;
  document.body.appendChild(doorOverlay);

  // بعد ما الاقتراب البطيء الهادئ يخلص (حوالي 5.2 ثانية)، الباب يفتح بطريقة طبيعية
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 5300);

  // التلاشي بعد فتح الباب
  setTimeout(() => {
    doorOverlay.classList.add("fade-out");
  }, 6500);

  // مسح العنصر تماماً من DOM
  setTimeout(() => {
    doorOverlay.remove();
  }, 7300);
});