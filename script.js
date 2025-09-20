// 🎭 Анимации появления элементов при скролле
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(section => observer.observe(section));
});

// 📝 Логика формы регистрации
const form = document.getElementById("registerForm");
const message = document.getElementById("formMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const team = document.getElementById("teamName").value;
  const captain = document.getElementById("captainName").value;
  const email = document.getElementById("email").value;

  if (team && captain && email) {
    message.textContent = "✅ Заявка успешно отправлена!";
    message.style.color = "green";

    // Очистка формы
    form.reset();
  } else {
    message.textContent = "❌ Пожалуйста, заполните все поля!";
    message.style.color = "red";
  }
});
