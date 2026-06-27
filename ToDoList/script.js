const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const STORAGE_KEY = "np-todos-v1";
const LINE_COUNT = 10;
const LINE_HEIGHT_PX = 42;
const MS_PER_DAY = 86_400_000;
const TOAST_DURATION = 2000;
const MAX_HISTORY_DAYS = 30;

const state = {
  data: loadFromStorage(),
  currentDate: todayDate(),
  selectedId: null,
  hlOpen: false,
};

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${d}`;
}

function getDayLabel(date) {
  const diff = Math.round((date - todayDate()) / MS_PER_DAY);
  const dayName = DAYS_EN[date.getDay()];
  if (diff === 0) return `Today · ${dayName}`;
  if (diff === -1) return `Yesterday · ${dayName}`;
  if (diff === 1) return `Tomorrow · ${dayName}`;
  return dayName;
}

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}
function getList(dateKey) {
  if (!state.data[dateKey]) state.data[dateKey] = [];
  return state.data[dateKey];
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function requireSelection() {
  if (!state.selectedId) {
    showToast("먼저 항목을 선택해주세요");
    return null;
  }
  return state.selectedId;
}

let toastTimer = null;

function showToast(message) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => toastEl.classList.add("hidden"),
    TOAST_DURATION,
  );
}

function openHlPopup(anchorEl) {
  state.hlOpen = true;
  const popup = document.getElementById("hl-popup");
  popup.classList.remove("hidden");

  const rect = anchorEl.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();
  const margin = 8;

  let top = rect.bottom + 6;
  let left = rect.left;

  if (left + popupRect.width + margin > window.innerWidth) {
    left = window.innerWidth - popupRect.width - margin;
  }

  if (rect.bottom + 6 + popupRect.height + margin > window.innerHeight) {
    top = rect.top - popupRect.height - 6;
  }

  popup.style.top = top + "px";
  popup.style.left = left + "px";

  document.getElementById("bb-highlight").classList.add("active");
}

function closeHlPopup() {
  state.hlOpen = false;
  document.getElementById("hl-popup").classList.add("hidden");
  document.getElementById("bb-highlight").classList.remove("active");
}

function toggleHlPopup(anchorEl) {
  state.hlOpen ? closeHlPopup() : openHlPopup(anchorEl);
}

function buildRuledLines() {
  const container = document.getElementById("ruled-lines");
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < LINE_COUNT; i++) {
    const line = document.createElement("div");
    line.className = "ruled-line";
    line.style.top = (i + 1) * LINE_HEIGHT_PX - 1 + "px";
    fragment.appendChild(line);
  }

  container.appendChild(fragment);
}

function createCheckbox(item) {
  const cb = document.createElement("div");
  cb.className = "cb" + (item.done ? " checked" : "");
  if (item.done) cb.textContent = "✓";
  return cb;
}

function createItemBody(item) {
  const body = document.createElement("div");
  body.className = "item-body";

  const textSpan = document.createElement("span");
  textSpan.className = ["todo-text", item.done ? "done" : "", item.hl || ""]
    .filter(Boolean)
    .join(" ");
  textSpan.textContent = item.text;
  body.appendChild(textSpan);

  if (item.movedFrom) {
    const badge = document.createElement("span");
    badge.className = "moved-badge";
    badge.textContent = `📅 ${item.movedFrom}에서 미뤄짐`;
    body.appendChild(badge);
  }

  return body;
}

function createTodoItem(item) {
  const li = document.createElement("li");
  li.className =
    "todo-item" + (state.selectedId === item.id ? " selected" : "");
  li.dataset.id = item.id;

  li.appendChild(createCheckbox(item));
  li.appendChild(createItemBody(item));

  return li;
}

function renderDateHeader() {
  document.getElementById("disp-date").textContent = formatDate(
    state.currentDate,
  );
  document.getElementById("disp-day").textContent = getDayLabel(
    state.currentDate,
  );
}

function renderList() {
  const list = getList(toKey(state.currentDate));
  const ul = document.getElementById("todo-list");

  if (list.length === 0) {
    const msg = document.createElement("li");
    msg.className = "empty-msg";
    msg.textContent = "이 날의 할 일이 없어요 ✏️";
    ul.replaceChildren(msg);
    return;
  }

  ul.replaceChildren(...list.map(createTodoItem));
}

function render() {
  renderDateHeader();
  renderList();
}

function handleGoDay(delta) {
  state.currentDate = addDays(state.currentDate, delta);
  state.selectedId = null;
  closeHlPopup();
  render();
}

function handleSelectItem(id) {
  const prev = state.selectedId;
  state.selectedId = prev === id ? null : id;

  if (prev) {
    document
      .querySelector(`.todo-item[data-id="${prev}"]`)
      ?.classList.remove("selected");
  }
  if (state.selectedId) {
    document
      .querySelector(`.todo-item[data-id="${state.selectedId}"]`)
      ?.classList.add("selected");
  }
}

function handleToggleDone(id) {
  const item = getList(toKey(state.currentDate)).find((x) => x.id === id);
  if (!item) return;

  item.done = !item.done;
  saveToStorage();
  render();
}

function handleSetHighlight(hl) {
  const id = requireSelection();
  if (!id) return;

  const item = getList(toKey(state.currentDate)).find((x) => x.id === id);
  if (!item) return;

  item.hl = hl;
  saveToStorage();
  closeHlPopup();

  document
    .querySelector(`.todo-item[data-id="${id}"]`)
    ?.classList.remove("selected");
  state.selectedId = null;

  render();
}

function handlePostpone(id) {
  const key = toKey(state.currentDate);
  const list = getList(key);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;

  const [item] = list.splice(idx, 1);
  const nextDate = addDays(state.currentDate, 1);
  const movedItem = {
    id: createId(),
    text: item.text,
    done: false,
    hl: item.hl,
    movedFrom: formatDate(state.currentDate),
  };

  getList(toKey(nextDate)).unshift(movedItem);
  saveToStorage();

  if (state.selectedId === id) state.selectedId = null;
  showToast(`📅 ${formatDate(nextDate)}으로 미뤄졌어요`);
  render();
}

function handleDelete(id) {
  const key = toKey(state.currentDate);
  const list = getList(key);
  const item = list.find((x) => x.id === id);
  if (!item) return;

  state.data[key] = list.filter((x) => x.id !== id);
  saveToStorage();

  if (state.selectedId === id) state.selectedId = null;
  showToast(`🗑 "${item.text}" 삭제됨`);
  render();
}

function handleAddTodo() {
  const input = document.getElementById("add-input");
  const text = input.value.trim();
  if (!text) return;
  const newItem = {
    id: createId(),
    text,
    done: false,
    hl: "",
    movedFrom: null,
  };

  getList(toKey(state.currentDate)).push(newItem);
  input.value = "";
  saveToStorage();
  render();
}

function handleBbPostpone() {
  const id = requireSelection();
  if (id) handlePostpone(id);
}

function handleBbHighlight() {
  if (!requireSelection()) return;
  toggleHlPopup(document.getElementById("bb-highlight"));
}

function handleBbDelete() {
  const id = requireSelection();
  if (id) handleDelete(id);
}

function bindEvents() {
  document
    .getElementById("prev-btn")
    .addEventListener("click", () => handleGoDay(-1));
  document
    .getElementById("next-btn")
    .addEventListener("click", () => handleGoDay(1));
  document.getElementById("add-btn").addEventListener("click", handleAddTodo);
  document.getElementById("add-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAddTodo();
  });

  document.getElementById("todo-list").addEventListener("click", (e) => {
    e.stopPropagation();

    const li = e.target.closest(".todo-item");
    if (!li) return;

    const id = li.dataset.id;
    const isCb = e.target.closest(".cb");

    if (isCb) {
      handleToggleDone(id);
    } else {
      handleSelectItem(id);
    }
  });

  document
    .getElementById("bb-postpone")
    .addEventListener("click", handleBbPostpone);
  document.getElementById("bb-highlight").addEventListener("click", (e) => {
    e.stopPropagation();
    handleBbHighlight();
  });
  document
    .getElementById("bb-delete")
    .addEventListener("click", handleBbDelete);
  document.getElementById("hl-popup").addEventListener("click", (e) => {
    e.stopPropagation();
    const dot = e.target.closest(".hl-dot");
    if (dot) handleSetHighlight(dot.dataset.hl);
  });

  document.addEventListener("click", () => {
    if (state.hlOpen) closeHlPopup();
  });
}

function init() {
  buildRuledLines();
  bindEvents();
  render();
}

init();
