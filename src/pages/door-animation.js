document.addEventListener("DOMContentLoaded", () => {
  // إنشاء هيكل الباب ديناميكياً
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="door-left"></div>
    <div class="door-right"></div>
  `;
  document.body.appendChild(doorOverlay);

  // تشغيل حركة الفتح بعد جزء من الثانية
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 200);

  // إزالة العنصر تماماً بعد انتهاء الحركة عشان ما يلمسش أي زرار أو يأثر على الثيم
  setTimeout(() => {
    doorOverlay.remove();
  }, 1700);
});