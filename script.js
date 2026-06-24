/**
 * Modern Responsive Calculator App Logic
 * Designed with a clean state machine and robust input validation.
 */

class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    /**
     * Resets all state variables to their default values.
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    /**
     * Deletes the last entered character from the current input.
     * If the length is 1, it resets the value to '0'.
     */
    delete() {
        if (this.isErrorState()) {
            this.clear();
            return;
        }

        // If screen was just computed, a delete acts as a clear
        if (this.shouldResetScreen) {
            this.clear();
            return;
        }

        if (this.currentOperand === '0') return;

        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    /**
     * Appends a number or decimal point to the current operand,
     * enforcing input validation rules.
     * @param {string} number - The character to append.
     */
    appendNumber(number) {
        // If we recently evaluated an expression, typing a new number starts a new expression
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        // Check for error state to reset
        if (this.isErrorState()) {
            this.clear();
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // If typing decimal on empty or initial '0' state, keep the '0' and append '.'
        if (number === '.' && (this.currentOperand === '0' || this.currentOperand === '')) {
            this.currentOperand = '0.';
            return;
        }

        // Replace leading zero with the new number
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    /**
     * Selects an operator (+, -, *, /) and chains evaluations if there are pending operands.
     * @param {string} operation - The chosen arithmetic operator.
     */
    chooseOperation(operation) {
        if (this.isErrorState()) {
            this.clear();
        }

        // Allow changing the operator if user makes a mistake before typing the next number
        if (this.currentOperand === '' || this.currentOperand === '0') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }

        // Evaluate previous equation if there's a chain of operations (e.g. 5 + 3 * 2)
        if (this.previousOperand !== '') {
            this.compute();
            if (this.isErrorState()) return; // Stop chaining if division by zero occurs
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetScreen = false;
    }

    /**
     * Performs the math calculation based on current state.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Prevent computation if operands are invalid numbers
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                // Graceful division-by-zero handling
                if (current === 0) {
                    this.currentOperand = 'Cannot divide by zero';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.shouldResetScreen = true;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating-point arithmetic precision (e.g., 0.1 + 0.2 = 0.3)
        this.currentOperand = parseFloat(computation.toFixed(10)).toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    /**
     * Checks if the calculator is showing an error message.
     * @returns {boolean}
     */
    isErrorState() {
        return this.currentOperand === 'Cannot divide by zero';
    }

    /**
     * Helper to format numbers with thousands separators for a premium feel,
     * while retaining decimal inputs dynamically.
     * @param {string|number} number - The raw input to format.
     * @returns {string} The formatted number.
     */
    getDisplayNumber(number) {
        if (number === 'Cannot divide by zero') return number;
        if (number === '') return '';

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            // format standard US English representation (e.g. 1,000)
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Updates the calculator screen elements.
     */
    updateDisplay() {
        // Display current value (fallback to '0' if empty)
        if (this.currentOperand === '' && this.previousOperand === '') {
            this.currentOperandTextElement.innerText = '0';
        } else if (this.currentOperand === '' && this.operation != null) {
            this.currentOperandTextElement.innerText = '0';
        } else {
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        }

        // Display previous expression (e.g. 5 +)
        if (this.operation != null) {
            let symbol = this.operation;
            if (symbol === '*') symbol = '×';
            if (symbol === '/') symbol = '÷';
            if (symbol === '-') symbol = '−';
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${symbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Instantiate the calculator when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');
    
    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    // Click handler for all button clicks
    const buttonsGrid = document.querySelector('.buttons-grid');
    buttonsGrid.addEventListener('click', (e) => {
        const target = e.target;
        
        // Ensure we clicked a button, not the grid gap
        if (!target.classList.contains('btn')) return;

        // Number Buttons
        if (target.dataset.number !== undefined) {
            calculator.appendNumber(target.dataset.number);
            calculator.updateDisplay();
        }

        // Operator Buttons
        if (target.dataset.operator !== undefined) {
            calculator.chooseOperation(target.dataset.operator);
            calculator.updateDisplay();
        }

        // Special Action Buttons
        if (target.dataset.action !== undefined) {
            const action = target.dataset.action;
            if (action === 'clear') {
                calculator.clear();
            } else if (action === 'delete') {
                calculator.delete();
            } else if (action === 'equals') {
                calculator.compute();
            }
            calculator.updateDisplay();
        }
    });

    // Keyboard support for enhanced accessibility and UX
    document.addEventListener('keydown', (e) => {
        let key = e.key;

        // Map operator keys
        if (key === '/') {
            e.preventDefault(); // Prevents browser search
            calculator.chooseOperation('/');
        } else if (key === '*') {
            calculator.chooseOperation('*');
        } else if (key === '-') {
            calculator.chooseOperation('-');
        } else if (key === '+') {
            calculator.chooseOperation('+');
        } 
        // Map numbers and decimal
        else if ((key >= '0' && key <= '9') || key === '.') {
            calculator.appendNumber(key);
        } 
        // Map enter and equals key to compute
        else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.compute();
        } 
        // Map delete
        else if (key === 'Backspace') {
            calculator.delete();
        } 
        // Map clear (AC) to Escape
        else if (key === 'Escape') {
            calculator.clear();
        } else {
            // Ignore other keypresses
            return;
        }

        calculator.updateDisplay();
        
        // Add active state styling to visual buttons on keypress
        highlightPressedButton(key);
    });

    /**
     * Briefly applies a visual press effect on the calculator button matching the keyboard key.
     * @param {string} key - The key pressed.
     */
    function highlightPressedButton(key) {
        let selector = '';
        if (key >= '0' && key <= '9') {
            selector = `button[data-number="${key}"]`;
        } else if (key === '.') {
            selector = 'button[data-number="."]';
        } else if (key === '/') {
            selector = '#btn-divide';
        } else if (key === '*') {
            selector = '#btn-multiply';
        } else if (key === '-') {
            selector = '#btn-subtract';
        } else if (key === '+') {
            selector = '#btn-add';
        } else if (key === 'Enter' || key === '=') {
            selector = '#btn-equals';
        } else if (key === 'Backspace') {
            selector = '#btn-delete';
        } else if (key === 'Escape') {
            selector = '#btn-clear';
        }

        if (selector) {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.classList.add('active-keyboard');
                // Temporary stylesheet insertion for the active styling, or just set transform/scale directly
                btn.style.transform = 'scale(0.94)';
                btn.style.filter = 'brightness(0.9)';
                setTimeout(() => {
                    btn.style.transform = '';
                    btn.style.filter = '';
                }, 100);
            }
        }
    }
});
