const displayCurrent = document.getElementById("display");
const displayPrevious = document.getElementById("previous-operand");
const buttons = document.querySelectorAll(".btn");

let currentOperand = "0";
let previousOperand = "";
let operation = undefined;
let shouldResetScreen = false;

// Format numbers for better display 
// Currently just ensures precision limits, classic calculators don't usually format commas 
// but we keep the logic clean.
function getDisplayNumber(number) {
  return number;
}

function clear() {
  currentOperand = "0";
  previousOperand = "";
  operation = undefined;
}

function deleteNumber() {
  if (currentOperand === "Error") {
    clear();
    return;
  }
  // Delete one char
  currentOperand = currentOperand.toString().slice(0, -1);
  if (currentOperand === "" || currentOperand === "-") {
    currentOperand = "0";
  }
}

function appendNumber(number) {
  if (currentOperand === "Error") clear();
  
  if (number === "." && currentOperand.includes(".")) return;
  
  if (shouldResetScreen) {
    if (number === ".") {
      currentOperand = "0.";
    } else {
      currentOperand = number;
    }
    shouldResetScreen = false;
    return;
  }
  
  if (currentOperand === "0" && number !== ".") {
    currentOperand = number;
  } else {
    currentOperand += number;
  }

  // Classic calculators often cap digits at ~10 or 12
  if (currentOperand.length > 12) {
    currentOperand = currentOperand.substring(0, 12);
  }
}

function chooseOperation(op) {
  if (currentOperand === "Error") return;
  
  if (currentOperand === "" && operation !== undefined) {
      // Just change operation if we haven't typed a new number
      operation = op;
      return;
  }
  if (currentOperand === "") return;
  
  if (previousOperand !== "") {
    compute();
  }
  
  operation = op;
  previousOperand = currentOperand;
  currentOperand = "";
  shouldResetScreen = false;
}

function compute() {
  let computation;
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  
  if (isNaN(prev) || isNaN(current)) return;

  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      if (current === 0) {
        currentOperand = "Error";
        operation = undefined;
        previousOperand = "";
        return;
      }
      computation = prev / current;
      break;
    default:
      return;
  }
  
  // limit precision to avoid long decimals common in arbitrary floats
  computation = Math.round(computation * 100000000) / 100000000;
  
  // Format long numbers
  let compStr = computation.toString();
  if (compStr.length > 12) { 
      // Very crude exponential if too big
      if (computation > 999999999999 || computation < -999999999999) {
          compStr = computation.toExponential(4);
      } else {
          compStr = compStr.substring(0, 12); // Trim decimals roughly
      }
  }

  currentOperand = compStr;
  operation = undefined;
  previousOperand = "";
}

function computePercent() {
  if (currentOperand === "Error") return;
  const current = parseFloat(currentOperand);
  if (isNaN(current)) return;
  
  let result = current / 100;
  result = Math.round(result * 100000000) / 100000000;  
  currentOperand = result.toString();
}

function updateDisplay() {
  if (currentOperand === "Error") {
    displayCurrent.innerText = "Error";
    displayPrevious.innerText = "";
    return;
  }
  
  displayCurrent.innerText = getDisplayNumber(currentOperand);
  
  if (operation != null) {
    const displayOp = operation === '*' ? '×' : (operation === '/' ? '÷' : operation);
    displayPrevious.innerText = `${previousOperand} ${displayOp}`;
  } else {
    displayPrevious.innerText = "";
  }
}

// Event Listeners for clicks
buttons.forEach(button => {
  button.addEventListener("click", () => {
    
    // Add small visual active click effect programmatically for quick taps
    button.blur(); // Remove focus to not retain active state visually in some browsers
    
    if (button.classList.contains("num-btn")) {
      appendNumber(button.dataset.value);
    } else if (button.dataset.action === "operator") {
      chooseOperation(button.dataset.value);
    } else if (button.dataset.action === "calculate") {
      compute();
      shouldResetScreen = true;
    } else if (button.dataset.action === "clear") {
      clear();
    } else if (button.dataset.action === "delete") {
      deleteNumber();
    } else if (button.dataset.action === "percent") {
      computePercent();
      shouldResetScreen = true;
    }
    updateDisplay();
  });
});

// Keyboard support
document.addEventListener("keydown", e => {
  if (e.key >= "0" && e.key <= "9" || e.key === ".") {
    appendNumber(e.key);
    updateDisplay();
  } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
    chooseOperation(e.key);
    updateDisplay();
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    compute();
    shouldResetScreen = true;
    updateDisplay();
  } else if (e.key === "Backspace") {
    deleteNumber();
    updateDisplay();
  } else if (e.key === "Escape") {
    clear();
    updateDisplay();
  } else if (e.key === "%") {
    computePercent();
    shouldResetScreen = true;
    updateDisplay();
  }
});
