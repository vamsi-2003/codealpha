// ===== Calculator Logic =====

const expressionEl = document.getElementById("expression");
const previewEl = document.getElementById("preview");
const buttons = document.querySelectorAll(".btn");

let expression = "";
let resultShown = false;

// Update the main display and the preview (real-time result)
function updateDisplay() {
  expressionEl.textContent = expression || "0";

  // Show live preview only when expression ends with a valid character
  // (allow % at the end, so 100*25% is valid)
  if (!expression || /[+\-*/.]$/.test(expression)) {
    previewEl.textContent = "";
    return;
  }

  try {
    // Convert numbers with % into (number/100), e.g. 25% -> (25/100)
    const sanitized = expression.replace(
      /(\d+(\.\d+)?)%/g,
      "($1/100)"
    );
    const result = new Function("return " + sanitized)();
    if (typeof result === "number" && isFinite(result)) {
      previewEl.textContent = "= " + result;
    } else {
      previewEl.textContent = "";
    }
  } catch (e) {
    previewEl.textContent = "";
  }
}

// Handle number input
function handleNumber(num) {
  if (resultShown) {
    // Start a new expression if last action was "="
    expression = "";
    resultShown = false;
  }
  expression += num;
  updateDisplay();
}

// Handle decimal input
function handleDecimal() {
  if (resultShown) {
    expression = "0";
    resultShown = false;
  }

  // Get last "number segment"
  const parts = expression.split(/[+\-*/%]/);
  const lastPart = parts[parts.length - 1];

  if (lastPart.includes(".")) {
    // Already has decimal in current number
    return;
  }

  if (!lastPart) {
    expression += "0.";
  } else {
    expression += ".";
  }

  updateDisplay();
}

// Handle operator input (+, -, *, /, %)
function handleOperator(op) {
  if (!expression) {
    // Allow only "-" at start for negative numbers
    if (op === "-") {
      expression = "-";
      updateDisplay();
    }
    return;
  }

  // Replace last operator if user presses another operator
  if (/[+\-*/%]$/.test(expression)) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }

  resultShown = false;
  updateDisplay();
}

// Clear last character
function handleClear() {
  if (!expression) return;
  expression = expression.slice(0, -1);
  resultShown = false;
  updateDisplay();
}

// All clear
function handleAllClear() {
  expression = "";
  resultShown = false;
  updateDisplay();
}

// Handle equals (=)
function handleEquals() {
  // Allow % at the end (e.g. 100*25%)
  if (!expression || /[+\-*/.]$/.test(expression)) return;

  try {
    // Same percent handling as in preview
    const sanitized = expression.replace(
      /(\d+(\.\d+)?)%/g,
      "($1/100)"
    );
    const result = new Function("return " + sanitized)();
    if (typeof result === "number" && isFinite(result)) {
      expression = String(result);
      resultShown = true;
      updateDisplay();
      previewEl.textContent = ""; // result is now main display
    }
  } catch (e) {
    expressionEl.textContent = "Error";
    previewEl.textContent = "";
    expression = "";
    resultShown = false;
  }
}

// ===== Button Click Handling =====
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const value = btn.dataset.value;

    switch (type) {
      case "number":
        handleNumber(value);
        break;
      case "decimal":
        handleDecimal();
        break;
      case "operator":
        handleOperator(value);
        break;
      case "all-clear":
        handleAllClear();
        break;
      case "clear":
        handleClear();
        break;
      case "equals":
        handleEquals();
        break;
      default:
        break;
    }
  });
});

// ===== Keyboard Support =====
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key >= "0" && key <= "9") {
    handleNumber(key);
    return;
  }

  if (key === ".") {
    handleDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
    return;
  }

  // Allow % from keyboard
  if (key === "%") {
    handleOperator("%");
    return;
  }

  if (key === "Enter" || key === "=") {
    e.preventDefault();
    handleEquals();
    return;
  }

  if (key === "Backspace") {
    handleClear();
    return;
  }

  if (key === "Escape") {
    handleAllClear();
    return;
  }

  // Optional: map "x" to multiply
  if (key.toLowerCase() === "x") {
    handleOperator("*");
  }
});
