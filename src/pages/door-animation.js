document.addEventListener("DOMContentLoaded", () => {
  // إنشاء هيكل الباب ديناميكياً
  const doorOverlay = document.createElement("div");
  doorOverlay.className = "church-door-overlay";
  doorOverlay.innerHTML = `
    <div class="door-left"></div>
    <div class="door-right"></div>
  `;
  document.body.appendChild(doorOverlay);

  // تشغيل حركة الفتح بعد جزء من الثانية من تحميل الصفحة
  setTimeout(() => {
    doorOverlay.classList.add("open");
  }, 300);

  // إزالة العنصر من DOM تماماً بعد انتهاء الحركة لضمان عدم تعطيل أي تفاعل
  setTimeout(() => {
    doorOverlay.classList.add("hidden-door");
  }, 1800);
});