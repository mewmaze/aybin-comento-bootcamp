const startBtn = document.querySelector("#start-btn");
const firstScreen = document.querySelector(".first-screen");
const portfolio = document.querySelector(".portfolio");

startBtn.addEventListener("click", () => {
  firstScreen.style.display = "none";
  portfolio.classList.remove("hidden");
});
