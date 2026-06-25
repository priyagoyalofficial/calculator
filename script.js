/**
 * Modern Responsive Calculator App Logic
 * Designed with a clean state machine, input validation, and multi-theme support.
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
     */
    delete() {
        if (this.isErrorState()) {
            this.clear();
            return;
        }

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
     * Appends a number or decimal point, enforcing validation rules.
     * @param {string} number - The character to append.
     */
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (this.isErrorState()) {
            this.clear();
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // Decimal fallback
        if (number === '.' && (this.currentOperand === '0' || this.currentOperand === '')) {
            this.currentOperand = '0.';
            return;
        }

        // Replace leading zero
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    /**
     * Selects an operator (+, -, *, /) and chains evaluations if there are pending operands.
     * @param {string} operation - The chosen operator.
     */
    chooseOperation(operation) {
        if (this.isErrorState()) {
            this.clear();
        }

        // Allow changing the operator if user makes a mistake
        if (this.currentOperand === '' || this.currentOperand === '0') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
            if (this.isErrorState()) return;
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetScreen = false;
    }

    /**
     * Performs calculation based on current state.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

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

        // Fix floating-point precision logic
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
     * Helper to format numbers with thousands separators.
     * @param {string|number} number - The raw input.
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
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Updates the screen elements.
     */
    updateDisplay() {
        if (this.currentOperand === '' && this.previousOperand === '') {
            this.currentOperandTextElement.innerText = '0';
        } else if (this.currentOperand === '' && this.operation != null) {
            this.currentOperandTextElement.innerText = '0';
        } else {
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        }

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

// Instantiate the calculator and bind listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');
    const themePanel = document.getElementById('theme-panel');
    
    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    // Initialize and persist themes
    const savedTheme = localStorage.getItem('calculator-theme') || 'classic';
    applyTheme(savedTheme);

    // Click handler for theme panel
    themePanel.addEventListener('click', (e) => {
        const themeBtn = e.target.closest('[data-theme-select]');
        if (!themeBtn) return;

        const selectedTheme = themeBtn.getAttribute('data-theme-select');
        applyTheme(selectedTheme);
    });

    /**
     * Sets document attributes, active button styles, and local storage values for selected theme.
     * @param {string} themeName - Name of the theme to apply.
     */
    function applyTheme(themeName) {
        if (themeName === 'star-wars') {
            document.body.setAttribute('data-theme', 'star-wars');
        } else {
            document.body.removeAttribute('data-theme');
        }

        // Set local storage
        localStorage.setItem('calculator-theme', themeName);

        // Update active class state on theme switcher buttons
        document.querySelectorAll('[data-theme-select]').forEach(btn => {
            if (btn.getAttribute('data-theme-select') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Spawns a floating Star Wars emoji/character at the center of the clicked/triggered button.
     * Only triggers when the Star Wars theme is active.
     * @param {HTMLElement} btnElement - The HTML element representing the button.
     */
    function spawnStarWarsCharacter(btnElement) {
        if (document.body.getAttribute('data-theme') !== 'star-wars') return;

        // Classic Star Wars Emojis/Characters
        const starWarsChars = ['👽', '🤖', '🛸', '🌑', '👤', '⚔️', '🪐', '🚀', '⭐', '💥'];
        const randomChar = starWarsChars[Math.floor(Math.random() * starWarsChars.length)];

        const characterElement = document.createElement('div');
        characterElement.classList.add('pop-character');
        characterElement.innerText = randomChar;

        // Position at the center of the clicked button
        const rect = btnElement.getBoundingClientRect();
        const x = rect.left + window.scrollX + rect.width / 2;
        const y = rect.top + window.scrollY + rect.height / 2;
        characterElement.style.left = `${x}px`;
        characterElement.style.top = `${y}px`;

        // Random travel offsets for the animation (relative to start)
        const dx = (Math.random() - 0.5) * window.innerWidth; // can be negative or positive
        const dy = (Math.random() - 0.5) * window.innerHeight;
        characterElement.style.setProperty('--dx', `${dx}px`);
        characterElement.style.setProperty('--dy', `${dy}px`);

        document.body.appendChild(characterElement);

        // Clean up after animation completes (5s)
        setTimeout(() => {
            characterElement.remove();
        }, 5000);
    }

    // Click handler for calculator buttons
    const buttonsGrid = document.querySelector('.buttons-grid');
    buttonsGrid.addEventListener('click', (e) => {
        const target = e.target;
        
        if (!target.classList.contains('btn')) return;

        // Spawn character particle if Star Wars theme is active
        spawnStarWarsCharacter(target);

        // Numbers and Decimal
        if (target.dataset.number !== undefined) {
            calculator.appendNumber(target.dataset.number);
            calculator.updateDisplay();
        }

        // Operators
        if (target.dataset.operator !== undefined) {
            calculator.chooseOperation(target.dataset.operator);
            calculator.updateDisplay();
        }

        // Actions (clear, delete, equals)
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

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        let key = e.key;
        let selector = '';

        if (key === '/') {
            e.preventDefault();
            calculator.chooseOperation('/');
            selector = '#btn-divide';
        } else if (key === '*') {
            calculator.chooseOperation('*');
            selector = '#btn-multiply';
        } else if (key === '-') {
            calculator.chooseOperation('-');
            selector = '#btn-subtract';
        } else if (key === '+') {
            calculator.chooseOperation('+');
            selector = '#btn-add';
        } else if ((key >= '0' && key <= '9') || key === '.') {
            calculator.appendNumber(key);
            selector = `button[data-number="${key}"]`;
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.compute();
            selector = '#btn-equals';
        } else if (key === 'Backspace') {
            calculator.delete();
            selector = '#btn-delete';
        } else if (key === 'Escape') {
            calculator.clear();
            selector = '#btn-clear';
        } else {
            return; // Ignore other keys
        }

        calculator.updateDisplay();
        
        // Highlight visual keys and trigger Star Wars characters for keyboard events
        if (selector) {
            const btn = document.querySelector(selector);
            if (btn) {
                // Spawn character pop-up
                spawnStarWarsCharacter(btn);

                // Add transient keyboard active styling
                btn.style.transform = 'scale(0.94)';
                btn.style.filter = 'brightness(0.9)';
                setTimeout(() => {
                    btn.style.transform = '';
                    btn.style.filter = '';
                }, 100);
            }
        }
    });
    // Shared like counter via countapi.xyz (localStorage fallback)
    const COUNTER_NS = 'priya-calculator-app';
    const COUNTER_KEY = 'heart-likes';
    const COUNTER_BASE = 'https://api.countapi.xyz';
    const likeBtn = document.getElementById('like-button');
    const likeCountEl = document.getElementById('like-count');
    const heartEl = likeBtn.querySelector('.heart');

    async function fetchCount() {
        try {
            const res = await Promise.race([
                fetch(`${COUNTER_BASE}/get/${COUNTER_NS}/${COUNTER_KEY}`),
                new Promise((_, reject) => setTimeout(() => reject('timeout'), 4000))
            ]);
            const data = await res.json();
            const val = parseInt(data.value);
            if (!isNaN(val)) localStorage.setItem('like-count', val);
            return isNaN(val) ? parseInt(localStorage.getItem('like-count') || '0') : val;
        } catch {
            return parseInt(localStorage.getItem('like-count') || '0');
        }
    }

    async function incrementCount() {
        try {
            const res = await fetch(`${COUNTER_BASE}/hit/${COUNTER_NS}/${COUNTER_KEY}`);
            const data = await res.json();
            localStorage.setItem('like-count', data.value);
            return data.value;
        } catch {
            const count = parseInt(localStorage.getItem('like-count') || '0') + 1;
            localStorage.setItem('like-count', count);
            return count;
        }
    }

    // Restore liked state on load
    if (localStorage.getItem('heart-liked') === 'true') {
        likeBtn.classList.add('liked');
        heartEl.textContent = '♥';
    }

    // Show cached count immediately, then refresh from shared API
    likeCountEl.textContent = localStorage.getItem('like-count') || '0';
    fetchCount().then(count => { likeCountEl.textContent = count; });

    likeBtn.addEventListener('click', async () => {
        const wasLiked = likeBtn.classList.contains('liked');
        likeBtn.classList.toggle('liked');
        if (!wasLiked) {
            heartEl.textContent = '♥';
            localStorage.setItem('heart-liked', 'true');
            const newCount = await incrementCount();
            likeCountEl.textContent = newCount;
        } else {
            heartEl.textContent = '♡';
            localStorage.setItem('heart-liked', 'false');
        }
    });
});
