const products = [
  { code: "11", name: "초코송이", price: 1000, image: "images/chocosongi.png" },
  {
    code: "12",
    name: "빼빼로",
    price: 1500,
    image: "images/pepero.png",
    tall: true,
  },
  { code: "13", name: "칸쵸", price: 1200, image: "images/kancho.png" },
  { code: "14", name: "가나초콜릿", price: 1400, image: "images/gana.png" },
  {
    code: "21",
    name: "미쯔",
    price: 1500,
    image: "images/miz.png",
    tall: true,
  },
  {
    code: "22",
    name: "다이제",
    price: 1700,
    image: "images/dige.png",
    tall: true,
  },
  {
    code: "23",
    name: "코카콜라",
    price: 2000,
    image: "images/cocacola.png",
    tall: true,
  },
  {
    code: "24",
    name: "사이다",
    price: 1800,
    image: "images/cider.png",
    tall: true,
  },
  {
    code: "31",
    name: "몬스터",
    price: 2500,
    image: "images/monster.png",
    tall: true,
  },
  {
    code: "32",
    name: "오레오",
    price: 1500,
    image: "images/oreo.png",
    tall: true,
  },
  { code: "33", name: "홈런볼", price: 1600, image: "images/homerunball.png" },
  {
    code: "34",
    name: "시리얼",
    price: 1800,
    image: "images/cereal.png",
    tall: true,
  },
];

let currentCode = "";
let selectedProduct = null;
let isPaying = false;

const displayCode = document.querySelector(".display-code");
const displayPrice = document.querySelector(".display-price");
const numberButtons = document.querySelectorAll(".number-btn");
const deleteButton = document.querySelector(".delete");
const confirmButton = document.querySelector(".confirm");
const productGrid = document.querySelector(".product-grid");
const cardSlot = document.querySelector(".card-slot");
const pickupBox = document.querySelector(".pickup-box");

function resetToIdle() {
  currentCode = "";
  selectedProduct = null;
  isPaying = false;
  cardSlot.classList.remove("active");
  displayCode.textContent = "판매중";
  displayPrice.textContent = "";
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (p) => `
    <div class="item" data-code="${p.code}">
      <div class="item-label">${p.code}</div>
      <img class="merchandise-img" src="${p.image}" alt="${p.name}" />
      <div class="item-price">₩${p.price.toLocaleString()}</div>
    </div>`,
    )
    .join("");
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (selectedProduct || isPaying) return;
    if (currentCode.length < 2) {
      currentCode += button.textContent;
      displayCode.textContent = currentCode;
    }
  });
});

deleteButton.addEventListener("click", () => {
  if (isPaying) return;

  if (selectedProduct) {
    resetToIdle();
    return;
  }

  currentCode = currentCode.slice(0, -1);
  displayCode.textContent = currentCode || "판매중";
});

confirmButton.addEventListener("click", () => {
  if (selectedProduct || isPaying) return;

  const found = products.find((p) => p.code === currentCode);

  if (!found) {
    displayCode.textContent = "없는 상품";
    currentCode = "";
    setTimeout(() => {
      if (!selectedProduct && currentCode === "" && !isPaying) {
        displayCode.textContent = "판매중";
      }
    }, 1000);
    return;
  }

  selectedProduct = found;
  currentCode = "";
  displayCode.textContent = selectedProduct.name;
  displayPrice.textContent = `${selectedProduct.price.toLocaleString()}원`;
  cardSlot.classList.add("active");
});

cardSlot.addEventListener("click", () => {
  if (!selectedProduct || isPaying) return;

  isPaying = true;
  displayCode.textContent = "결제중";
  displayPrice.textContent = "";
  pickupBox.innerHTML = `<img src="${selectedProduct.image}" class="pickup-img${selectedProduct.tall ? " rotated" : ""}" />`;

  setTimeout(() => {
    pickupBox.innerHTML = "";
    resetToIdle();
  }, 2000);
});

renderProducts();
resetToIdle();
