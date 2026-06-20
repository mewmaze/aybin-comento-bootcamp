const calculatorState = {
  currentExpression: "",
  isPowerOn: true,
  history: [],
  isHistoryMode: false,
  currentHistoryIndex: 0,
  isResultDisplayed: false,
};

const calculator = document.getElementById("calculator");
const displayBox = document.getElementById("displayBox");
const modeIndicator = document.getElementById("modeIndicator");
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const historyBtn = document.getElementById("historyBtn");

const MAX_LENGTH = 11;

function resetState() {
  calculatorState.currentExpression = "";
  calculatorState.isHistoryMode = false;
  calculatorState.currentHistoryIndex = 0;
  calculatorState.isResultDisplayed = false;

  if (historyBtn) historyBtn.classList.remove("history-active");
  if (modeIndicator) modeIndicator.innerText = "● 계산 모드";
  if (expressionDisplay) expressionDisplay.innerText = "";
  if (resultDisplay) resultDisplay.innerText = "0";
}

function isValidSequence(nextChar) {
  let expr = calculatorState.currentExpression;
  let lastChar = expr.slice(-1);

  if (expr.length >= MAX_LENGTH) return false;

  if (nextChar === ".") {
    if (expr === "" || /[+\-*/(]$/.test(expr)) return false;
    if (lastChar === ".") return false;
    let tokens = expr.split(/[+\-*/()]/);
    let lastToken = tokens[tokens.length - 1];
    if (lastToken.includes(".")) return false;
  }

  if (nextChar === "(") {
    if (lastChar === ".") return false;
    if (/[0-9)]$/.test(lastChar)) return false;
  }
  if (nextChar === ")") {
    if (lastChar === "(" || lastChar === "." || /[+\-*/]$/.test(lastChar))
      return false;

    let openCount = (expr.match(/\(/g) || []).length;
    let closeCount = (expr.match(/\)/g) || []).length;
    if (closeCount >= openCount) return false;
  }

  return true;
}

function inputNumber(num) {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.isHistoryMode) exitHistoryMode();
  if (calculatorState.isResultDisplayed) {
    calculatorState.currentExpression = "";
    calculatorState.isResultDisplayed = false;
  }
  if (calculatorState.currentExpression.length >= MAX_LENGTH) return;
  if (calculatorState.currentExpression.slice(-1) === ")") return;

  calculatorState.currentExpression += num;
  updateDisplay();
}

function inputOperator(op) {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.isHistoryMode) exitHistoryMode();
  if (calculatorState.isResultDisplayed) {
    calculatorState.isResultDisplayed = false;
  }
  if (!isValidSequence(op)) return;

  calculatorState.currentExpression += op;
  updateDisplay();
}

function inputBracket(bracket) {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.isHistoryMode) exitHistoryMode();
  if (calculatorState.isResultDisplayed) {
    calculatorState.isResultDisplayed = false;
  }
  if (!isValidSequence(bracket)) return;

  calculatorState.currentExpression += bracket;
  updateDisplay();
}

function inputDot(dot) {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.isHistoryMode) exitHistoryMode();
  if (calculatorState.isResultDisplayed) {
    calculatorState.currentExpression = "0";
    calculatorState.isResultDisplayed = false;
  }
  if (calculatorState.isResultDisplayed) {
    calculatorState.isResultDisplayed = false;
  }
  if (!isValidSequence(dot)) return;

  calculatorState.currentExpression += dot;
  updateDisplay();
}

function clearEntry() {
  if (!calculatorState.isPowerOn) return;
  resetState();
}

function backspace() {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.isHistoryMode) exitHistoryMode();

  if (calculatorState.isResultDisplayed) {
    calculatorState.currentExpression = "";
    calculatorState.isResultDisplayed = false;
    updateDisplay();
    return;
  }

  let expr = calculatorState.currentExpression;
  if (expr.length > 0) {
    calculatorState.currentExpression = expr.slice(0, -1);
    updateDisplay();
  }
}

function calculateResult() {
  if (
    !calculatorState.isPowerOn ||
    calculatorState.isHistoryMode ||
    calculatorState.currentExpression === ""
  )
    return;

  let expr = calculatorState.currentExpression;

  let openCount = (expr.match(/\(/g) || []).length;
  let closeCount = (expr.match(/\)/g) || []).length;
  if (openCount !== closeCount || /[+\-*/.]$/.test(expr) || /\(\)/.test(expr)) {
    resultDisplay.innerText = "Error";
    return;
  }

  try {
    let evalResult = eval(expr);

    if (
      evalResult === undefined ||
      isNaN(evalResult) ||
      !isFinite(evalResult)
    ) {
      throw new Error();
    }

    let displayResult = evalResult;
    if (typeof evalResult === "number" && !Number.isInteger(evalResult)) {
      let strResult = String(evalResult);
      if (strResult.length > MAX_LENGTH) {
        let integerLength = String(Math.floor(Math.abs(evalResult))).length;
        let allowedDecimals = MAX_LENGTH - integerLength - 1;

        if (allowedDecimals > 0) {
          displayResult = Number(evalResult.toFixed(allowedDecimals));
        } else {
          displayResult = Math.round(evalResult);
        }
      }
    }

    expressionDisplay.innerText = calculatorState.currentExpression + " =";
    resultDisplay.innerText = displayResult;

    addHistory(calculatorState.currentExpression, displayResult);
    calculatorState.currentExpression = String(displayResult);

    calculatorState.isResultDisplayed = true;
  } catch (error) {
    resultDisplay.innerText = "Error";
  }
}

function addHistory(expr, res) {
  calculatorState.history.unshift({ expr: expr, res: res });
  if (calculatorState.history.length > 5) calculatorState.history.pop();
}

function toggleHistoryMode() {
  if (!calculatorState.isPowerOn) return;
  if (calculatorState.history.length === 0) return;

  if (!calculatorState.isHistoryMode) {
    calculatorState.isHistoryMode = true;
    calculatorState.currentHistoryIndex = 0;
    historyBtn.classList.add("history-active");
    modeIndicator.innerText = `● 기록 모드 (1/${calculatorState.history.length})`;
    showHistoryItem();
  } else {
    calculatorState.currentHistoryIndex =
      (calculatorState.currentHistoryIndex + 1) %
      calculatorState.history.length;
    modeIndicator.innerText = `● 기록 모드 (${calculatorState.currentHistoryIndex + 1}/${calculatorState.history.length})`;
    showHistoryItem();
  }
}

function showHistoryItem() {
  let item = calculatorState.history[calculatorState.currentHistoryIndex];
  expressionDisplay.innerText = `${item.expr} =`;
  resultDisplay.innerText = item.res;
}

function exitHistoryMode() {
  calculatorState.isHistoryMode = false;
  historyBtn.classList.remove("history-active");
  modeIndicator.innerText = "● 계산 모드";
  expressionDisplay.innerText = "";
  resultDisplay.innerText = calculatorState.currentExpression || "0";
}

function updateDisplay() {
  expressionDisplay.innerText = "";
  resultDisplay.innerText = calculatorState.currentExpression || "0";
}

function togglePower() {
  calculatorState.isPowerOn = !calculatorState.isPowerOn;
  if (!calculatorState.isPowerOn) {
    calculator.classList.add("disabled");
    displayBox.classList.add("blackout");
    resetState();
  } else {
    calculator.classList.remove("disabled");
    displayBox.classList.remove("blackout");
    resetState();
  }
}
