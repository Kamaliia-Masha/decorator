# Decorator Game 🏠

The project is a 2D decorator game powered by the **Phaser 3** engine. You play as an interior design agent, fulfilling client orders.

## 🌐 Play Online

The game is deployed and available at:
**https://zingy-horse-f22bb2.netlify.app/**

---

## 🚀 How to Run the Game Locally

Since the game uses external resources (assets) and loads them via scripts, browsers block direct launching of the `index.html` file via `file://` (CORS error). You need to run a simple local HTTP server.

Choose any method convenient for you:

### Option 1: Using Python (pre-installed on most systems)
Open a terminal in the project folder and run:
```bash
python3 -m http.server 8000
```
Then open in your browser: `http://localhost:8000`

### Option 2: Using Node.js (npx)
If you have Node.js installed, run:
```bash
npx serve .
```
The game will be available at the address indicated by the utility (usually `http://localhost:3000`).

### Option 3: Live Server Extension (for VS Code)
1. Install the **Live Server** extension in VS Code.
2. Right-click on the `index.html` file and select **"Open with Live Server"**.

---

## 🎮 Gameplay

1. **Accepting an Order**: Look at the brief from the client (e.g., Kamaliia the rabbit).
2. **Decorating**: 
   - Click the buttons on the bottom panel to add furniture.
   - **Drag and drop** items with your mouse. Items can be placed on the floor or hung on the walls (windows, mirrors).
   - **Double-click** an item to remove it from the room.
3. **Completion**: Click the **"Submit Work"** button to receive payment and client feedback.

## 🛠 Tech Stack
- **Phaser 3** (Arcade Physics) — game engine.
- **JavaScript/HTML5** — core logic.
- **CSS** — UI and room background.

---
Developed as part of the Decorator project.
