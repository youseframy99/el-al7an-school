const toggleBtn = document.getElementById("theme-toggle");
const saved = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", saved);
updateBtnText(saved);

toggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateBtnText(next);
});

function updateBtnText(mode) {
  toggleBtn.textContent = mode === "dark" ? "☀️ فاتح" : "🌙 داكن";
}
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // أول ما الصفحة تفتح: تطبيق الثيم على الصفحة كلها
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  } else {
    body.classList.remove("dark-mode");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  // عند الضغط على الزرار
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      
      const isDarkMode = body.classList.contains("dark-mode");
      
      themeToggleBtn.innerHTML = isDarkMode 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';

      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    });
  }
});