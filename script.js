const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
let expression = "";

// Safe evaluation function to replace eval()
function safeEvaluate(expr) {
  try {
    // Replace ** with Math.pow for better compatibility
    expr = expr.replace(/(\d+\.?\d*)\*\*(\d+\.?\d*)/g, 'Math.pow($1,$2)');

    // Create a safe evaluation using Function constructor
    const result = Function('"use strict"; return (' + expr + ')')();

    // Check for invalid results
    if (!isFinite(result)) {
      return "Error";
    }

    return result.toString();
  } catch (error) {
    return "Error";
  }
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    // Reset if previous result was an error
    if (expression === "Error" && value !== "C") {
      expression = "";
    }

    if (value === "C") {
      expression = "";
    } else if (value === "DEL") {
      expression = expression.slice(0, -1);
    } else if (value === "=") {
      expression = safeEvaluate(expression);
    } else if (value === "PI") {
      expression += Math.PI.toFixed(8);
    } else if (value === "sqrt") {
      expression += "Math.sqrt(";
    } else if (value === "log") {
      expression += "Math.log10(";
    } else if (value === "exp") {
      expression += "Math.exp(";
    } else if (value === "sin") {
      expression += "Math.sin(";
    } else if (value === "cos") {
      expression += "Math.cos(";
    } else if (value === "tan") {
      expression += "Math.tan(";
    } else if (value === "^2") {
      expression += "**2";
    } else {
      expression += value;
    }

    display.innerText = expression || "0";
  });
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (expression === "Error") {
    expression = "";
  }

  if (e.key >= "0" && e.key <= "9") {
    expression += e.key;
    display.innerText = expression;
  } else if (e.key === "Enter") {
    expression = safeEvaluate(expression);
    display.innerText = expression || "0";
  } else if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    display.innerText = expression || "0";
  } else if (["+", "-", "*", "/", "(", ")", "."].includes(e.key)) {
    expression += e.key;
    display.innerText = expression;
  } else if (e.key === "Escape") {
    expression = "";
    display.innerText = "0";
  }
});
