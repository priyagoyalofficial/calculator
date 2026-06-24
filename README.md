# Modern Responsive Calculator

A clean, modern, and responsive calculator web application featuring a premium glassmorphic UI design, robust mathematical operation logic, and native keyboard hotkeys.

## 🎨 Design & Palette

The design centers the calculator on the page with smooth hover transitions and physical tactile scale downs on click. It utilizes a curated color palette:

- **Dark Navy (`#293241`)**: Main body & text contrast
- **Dark Blue (`#3d5a80`)**: Number buttons
- **Light Blue (`#98c1d9`)**: Special operational buttons (`AC`, `DEL`)
- **Very Light Cyan (`#e0fbfc`)**: Screen background & display typography
- **Orange (`#ee6c4d`)**: Operators & prominent equals (`=`) button

## ⚡ Features

- **Standard Operations**: Addition, subtraction, multiplication, and division.
- **Robust State Machine**: Handles expressions dynamically, showing equation history in a smaller top line.
- **Float Rounding**: Fixes common JavaScript binary float precision bugs (e.g. `0.1 + 0.2 = 0.3`).
- **Division-by-Zero Protection**: Displays a friendly `"Cannot divide by zero"` message instead of breaking.
- **Input Validation**: Prevents consecutive decimal points (e.g., `5.5.5` is blocked) and resolves leading zeros.
- **Aesthetic Hover Transitions**: Smooth animations on interactive elements.
- **Tactile Click Feedback**: Visual button scale downs upon interaction.
- **Keyboard Support**: Fully operational using physical keyboard hotkeys.

## ⌨️ Keyboard Shortcuts

| Action / Symbol | Keyboard Key |
| :--- | :--- |
| **0 – 9** | `0` – `9` |
| **Decimal** | `.` |
| **Add / Subtract** | `+` / `-` |
| **Multiply / Divide** | `*` / `/` |
| **Evaluate / Equals** | `Enter` or `=` |
| **Clear All (AC)** | `Escape` |
| **Backspace (DEL)** | `Backspace` |

## 🚀 Getting Started

No compilation, installations, or frameworks needed! You can run this purely client-side:

### 1. Direct Execution
Open the `index.html` file in any modern web browser.

### 2. Local HTTP Server
Alternatively, you can run a local server:

- **Python**:
  ```bash
  python -m http.server 9090
  ```
- **Node.js**:
  ```bash
  npx http-server -p 9090
  ```

Once running, navigate to `http://localhost:9090` in your browser.
