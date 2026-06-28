const ID_MIN_LENGTH = 4;
const ID_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

let currentStep = 0;
let idChecked = false;

const signupData = {
  id: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
};

const existingIds = ["admin", "test01", "user123", "comento"];

const steps = [
  {
    title: "아이디를 입력해주세요",
    description: "영문, 숫자 4~20자",
    render: createIdContent,
    validate: validateId,
  },
  {
    title: "비밀번호를 입력해주세요",
    description: "8자 이상, 영문/숫자/특수문자 포함",
    render: createPasswordContent,
    validate: validatePassword,
  },
  {
    title: "비밀번호를 다시 입력해주세요",
    description: "",
    render: createPasswordConfirmContent,
    validate: validatePasswordConfirm,
  },
  {
    title: "닉네임을 설정해주세요",
    description: "직접 입력하거나 랜덤 생성을 눌러보세요",
    render: createNicknameContent,
    validate: validateNickname,
  },
  {
    title: "회원가입 완료",
    description: "",
    render: createCompleteContent,
    validate: () => true,
  },
];

const stepNumberEl = document.querySelector("#stepNumber");
const titleEl = document.querySelector("#title");
const descriptionEl = document.querySelector("#description");
const contentEl = document.querySelector("#content");
const nextButton = document.querySelector("#nextButton");
const prevButton = document.querySelector("#prevButton");
const stepEls = document.querySelectorAll(".step");

init();

function init() {
  nextButton.addEventListener("click", handleNextStep);
  prevButton.addEventListener("click", handlePrevStep);
  renderStep();
}

function renderStep() {
  const step = steps[currentStep];
  stepNumberEl.textContent = String(currentStep + 1).padStart(2, "0");
  titleEl.textContent = step.title;
  descriptionEl.textContent = step.description;
  contentEl.replaceChildren();
  step.render();
  stepEls.forEach((el, i) => {
    el.classList.toggle("active", i <= currentStep);
  });
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  prevButton.style.display = isFirst || isLast ? "none" : "block";
  nextButton.style.display = isLast ? "none" : "block";
}

function handleNextStep() {
  if (!steps[currentStep].validate()) return;
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep();
  }
}

function handlePrevStep() {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  }
}

function createInput(type, placeholder) {
  const input = document.createElement("input");
  input.type = type;
  input.placeholder = placeholder;
  return input;
}

function createButton(text, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  if (className) button.className = className;
  return button;
}

function createMessage() {
  return document.createElement("p");
}

function getEyeIcon(visible) {
  if (visible) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;
  } else {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }
}

function createEyeButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "eye-btn";
  btn.innerHTML = getEyeIcon(false);
  return btn;
}

function createIdContent() {
  const container = document.createElement("div");
  container.className = "id-container";

  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";

  const input = createInput("text", "아이디를 입력해주세요");
  input.value = signupData.id;

  const duplicateButton = createButton("중복 확인", "duplicate-btn");
  const message = createMessage();

  input.addEventListener("input", (e) => {
    signupData.id = e.target.value;
    idChecked = false;
    message.textContent = "";
    message.className = "";
  });

  duplicateButton.addEventListener("click", () => {
    const id = signupData.id.trim();

    if (id === "") {
      message.textContent = "아이디를 입력해주세요.";
      message.className = "error";
      idChecked = false;
      return;
    }

    if (
      !/^[a-zA-Z0-9]+$/.test(id) ||
      id.length < ID_MIN_LENGTH ||
      id.length > ID_MAX_LENGTH
    ) {
      message.textContent = `영문, 숫자 ${ID_MIN_LENGTH}~${ID_MAX_LENGTH}자로 입력해주세요.`;
      message.className = "error";
      idChecked = false;
      return;
    }

    if (existingIds.includes(id)) {
      message.textContent = "이미 사용 중인 아이디입니다.";
      message.className = "error";
      idChecked = false;
      return;
    }

    message.textContent = "사용 가능한 아이디입니다.";
    message.className = "success";
    idChecked = true;
  });

  wrapper.append(input, duplicateButton);
  container.append(wrapper, message);
  contentEl.append(container);
}

function validateId() {
  if (!idChecked) {
    const message = contentEl.querySelector("p");
    if (message) {
      message.textContent = "아이디 중복확인을 해주세요.";
      message.className = "error";
    }
    return false;
  }
  return signupData.id.trim() !== "";
}

function createPasswordContent() {
  const container = document.createElement("div");
  container.className = "password-container";

  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";

  const input = createInput("password", "비밀번호를 입력해주세요");
  input.value = signupData.password;

  const eyeBtn = createEyeButton();
  let isVisible = false;

  eyeBtn.addEventListener("click", () => {
    isVisible = !isVisible;
    input.type = isVisible ? "text" : "password";
    eyeBtn.innerHTML = getEyeIcon(isVisible);
  });

  input.addEventListener("input", (e) => {
    signupData.password = e.target.value;
    updatePasswordCondition(conditionList);
  });

  wrapper.append(input, eyeBtn);

  const conditionList = createPasswordCondition();
  container.append(wrapper, conditionList);
  contentEl.append(container);

  if (signupData.password !== "") {
    updatePasswordCondition(conditionList);
  }
}

function createPasswordCondition() {
  const ul = document.createElement("ul");
  ul.id = "passwordCondition";

  const conditions = [
    `${PASSWORD_MIN_LENGTH}자 이상`,
    `${PASSWORD_MAX_LENGTH}자 이하`,
    "영문 포함",
    "숫자 포함",
    "특수문자 포함",
  ];

  conditions.forEach((text) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="check-icon"></span>${text}`;
    ul.append(li);
  });

  return ul;
}

function updatePasswordCondition(ul) {
  const pw = signupData.password;
  const checks = [
    pw.length >= PASSWORD_MIN_LENGTH,
    pw.length <= PASSWORD_MAX_LENGTH && pw.length > 0,
    /[a-zA-Z]/.test(pw),
    /\d/.test(pw),
    /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  ];

  [...ul.children].forEach((li, i) => {
    li.classList.toggle("success", checks[i]);
  });
}

function validatePassword() {
  const pw = signupData.password;
  return (
    pw.length >= PASSWORD_MIN_LENGTH &&
    pw.length <= PASSWORD_MAX_LENGTH &&
    /[a-zA-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  );
}

function createPasswordConfirmContent() {
  const container = document.createElement("div");

  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";

  const input = createInput("password", "비밀번호를 다시 입력해주세요");
  input.value = signupData.passwordConfirm;

  const eyeBtn = createEyeButton();
  let isVisible = false;
  const message = createMessage();

  eyeBtn.addEventListener("click", () => {
    isVisible = !isVisible;
    input.type = isVisible ? "text" : "password";
    eyeBtn.innerHTML = getEyeIcon(isVisible);
  });

  input.addEventListener("input", (e) => {
    signupData.passwordConfirm = e.target.value;

    if (signupData.passwordConfirm === "") {
      message.textContent = "";
      message.className = "";
      return;
    }

    if (signupData.password === signupData.passwordConfirm) {
      message.textContent = "비밀번호가 일치합니다.";
      message.className = "success";
    } else {
      message.textContent = "비밀번호가 일치하지 않습니다.";
      message.className = "error";
    }
  });

  wrapper.append(input, eyeBtn);
  container.append(wrapper, message);
  contentEl.append(container);
}

function validatePasswordConfirm() {
  if (
    signupData.password === "" ||
    signupData.password !== signupData.passwordConfirm
  ) {
    const message = contentEl.querySelector("p");
    if (message) {
      message.textContent = "비밀번호가 일치하지 않습니다.";
      message.className = "error";
    }
    return false;
  }
  return true;
}

const nicknameList = [
  "행복한사자",
  "귀여운호랑이",
  "푸른고래",
  "멋진펭귄",
  "따뜻한여우",
  "용감한토끼",
  "시원한독수리",
  "반짝이는고양이",
  "춤추는판다",
  "웃는햄스터",
];

function getRandomNickname() {
  return nicknameList[Math.floor(Math.random() * nicknameList.length)];
}

function createNicknameContent() {
  const container = document.createElement("div");
  container.className = "nickname-container";

  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";

  const input = createInput("text", "닉네임을 입력해주세요");
  input.value = signupData.nickname;

  input.addEventListener("input", (e) => {
    signupData.nickname = e.target.value;
  });

  wrapper.append(input);
  container.append(wrapper);

  const randomArea = document.createElement("div");
  randomArea.className = "random-area";

  const randomLabel = document.createElement("span");
  randomLabel.className = "random-label";
  randomLabel.textContent = "랜덤 닉네임";

  const randomBtn = createButton("🎲 생성", "random-btn");

  randomBtn.addEventListener("click", () => {
    const nickname = getRandomNickname();
    signupData.nickname = nickname;
    input.value = nickname;
  });

  randomArea.append(randomLabel, randomBtn);
  container.append(randomArea);
  contentEl.append(container);
}

function validateNickname() {
  if (signupData.nickname.trim() === "") {
    alert("닉네임을 입력하거나 랜덤 생성을 눌러주세요.");
    return false;
  }
  return true;
}

function createCompleteContent() {
  const container = document.createElement("div");
  container.className = "complete";

  const icon = document.createElement("div");
  icon.className = "complete-icon";
  icon.textContent = "🎉";

  const h2 = document.createElement("h2");
  h2.textContent = "회원가입 완료";

  const desc = document.createElement("p");
  desc.textContent = `${signupData.nickname}님 환영합니다!`;

  container.append(icon, h2, desc);
  contentEl.append(container);
}
