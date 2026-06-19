document.addEventListener("DOMContentLoaded", () => {
  const clockString = document.getElementById("clock-string");
  const dateString = document.getElementById("date-string");
  const clockBox = document.getElementById("clock-box-area");

  const h10 = document.getElementById("hour-10");
  const h1 = document.getElementById("hour-1");
  const m10 = document.getElementById("min-10");
  const m1 = document.getElementById("min-1");
  const s10 = document.getElementById("sec-10");
  const s1 = document.getElementById("sec-1");

  const addAlarmBtn = document.getElementById("add-alarm-btn");
  const alarmListContainer = document.getElementById("alarm-list-container");

  const batteryBar = document.getElementById("battery-bar");
  const batteryText = document.getElementById("battery-text");
  const chargeBtn = document.getElementById("charge-btn");
  const ampmButtons = document.querySelectorAll(".ampm-toggle-btn");

  const clockState = {
    alarms: [],
    batteryLeft: 100,
    selectedAmpm: "AM",
  };

  // 시간을 AM/PM 으로 변경
  function convertTo12Hour(timeStr, isForList = false) {
    const [partsHour, partsMin, partsSec] = timeStr.split(":");
    let hourInt = parseInt(partsHour);
    const ampmText = hourInt >= 12 ? "PM" : "AM";

    let displayHour = hourInt % 12;
    if (displayHour === 0) displayHour = 12;

    const finalHourStr = String(displayHour).padStart(2, "0");
    const className = isForList ? "list-ampm" : "time-ampm";

    return `<span class="${className}">${ampmText}</span>${finalHourStr}:${partsMin}:${partsSec}`;
  }

  function updateBattery(value) {
    clockState.batteryLeft = Math.max(0, value);
    renderBatteryUI();
  }

  function resetState() {
    clockState.batteryLeft = 100;
    clockState.alarms.forEach((alarm) => (alarm.triggered = false));
    renderBatteryUI();
    renderAlarms();
  }

  function renderBatteryUI() {
    batteryText.textContent = `${clockState.batteryLeft}%`;
    batteryBar.style.width = `${clockState.batteryLeft}%`;

    if (clockState.batteryLeft <= 20) {
      batteryBar.style.backgroundColor = "var(--color-background-battery-low)";
    } else if (clockState.batteryLeft <= 69) {
      batteryBar.style.backgroundColor =
        "var(--color-background-battery-medium)";
    } else {
      batteryBar.style.backgroundColor = "var(--color-background-battery-high)";
    }
  }

  function renderAlarms() {
    alarmListContainer.innerHTML = "";

    if (clockState.alarms.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "empty-alarm-box";
      emptyBox.innerHTML = `
        <div class="emoji">⏰</div>
        <span>알람을 추가하세요!</span>
      `;
      alarmListContainer.appendChild(emptyBox);
      return;
    }

    clockState.alarms.forEach((alarm, index) => {
      const item = document.createElement("div");
      item.className = `alarm-item ${alarm.triggered ? "triggered" : ""}`;

      const displayHtml = convertTo12Hour(alarm.time, true);

      item.innerHTML = `
        <div class="alarm-item-left">
          <i class="fa-regular fa-bell"></i>
          <span>${displayHtml}</span>
        </div>
        <button class="delete-btn" data-index="${index}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      alarmListContainer.appendChild(item);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", handleDeleteAlarm);
    });
  }

  function handleToggleAmpm(e) {
    ampmButtons.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    clockState.selectedAmpm = e.target.getAttribute("data-value");
  }

  function handleDeleteAlarm(e) {
    const idx = e.currentTarget.getAttribute("data-index");
    clockState.alarms.splice(idx, 1);
    renderAlarms();
  }

  function handleCharge() {
    resetState();
  }

  function handleAddAlarm() {
    if (clockState.alarms.length >= 3) {
      alert("알람은 최대 3개까지만 등록할 수 있습니다.");
      return;
    }

    let inputHour = parseInt(h10.value + h1.value);
    let inputMin = parseInt(m10.value + m1.value);
    let inputSec = parseInt(s10.value + s1.value);

    if (inputHour < 1 || inputHour > 12) {
      alert("올바르지 않은 시간입니다. (01시 ~ 12시 사이로 선택해주세요)");
      return;
    }
    if (inputMin > 59 || inputSec > 59) {
      alert("올바르지 않은 시간 단위 선택입니다.");
      return;
    }

    if (clockState.selectedAmpm === "PM" && inputHour !== 12) {
      inputHour += 12;
    } else if (clockState.selectedAmpm === "AM" && inputHour === 12) {
      inputHour = 0;
    }

    const finalHStr = String(inputHour).padStart(2, "0");
    const finalMStr = String(inputMin).padStart(2, "0");
    const finalSStr = String(inputSec).padStart(2, "0");
    const inputTimeStr = `${finalHStr}:${finalMStr}:${finalSStr}`;

    const isDuplicate = clockState.alarms.some(
      (alarm) => alarm.time === inputTimeStr,
    );
    if (isDuplicate) {
      alert("이미 동일한 시간에 등록된 알람이 존재합니다.");
      return;
    }

    clockState.alarms.push({ time: inputTimeStr, triggered: false });
    clockState.alarms.sort((a, b) => a.time.localeCompare(b.time));
    renderAlarms();
  }

  function initOptions() {
    const selectors = [h10, h1, m10, m1, s10, s1];
    selectors.forEach((selectElement) => {
      for (let i = 0; i < 10; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        selectElement.appendChild(opt);
      }
    });
    h1.value = "1";
  }

  function runClock() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    dateString.textContent = `${year}-${month}-${date} ${dayNames[now.getDay()]}`;

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const currentTimeStr = `${hours}:${minutes}:${seconds}`;

    clockString.innerHTML = convertTo12Hour(currentTimeStr);

    if (clockState.batteryLeft <= 0) {
      clockBox.classList.add("blackout");
    } else {
      clockBox.classList.remove("blackout");

      clockState.alarms.forEach((alarm) => {
        if (alarm.time === currentTimeStr && !alarm.triggered) {
          alarm.triggered = true;
          renderAlarms();
        }
      });
    }
  }

  ampmButtons.forEach((btn) => btn.addEventListener("click", handleToggleAmpm));
  addAlarmBtn.addEventListener("click", handleAddAlarm);
  chargeBtn.addEventListener("click", handleCharge);

  setInterval(() => {
    if (clockState.batteryLeft > 0) {
      updateBattery(clockState.batteryLeft - 1);
    }
  }, 1000);

  initOptions();
  renderAlarms();
  setInterval(runClock, 1000);
  runClock();
  renderBatteryUI();
});
