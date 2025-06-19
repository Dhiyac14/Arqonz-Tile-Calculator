# ARQONZ Tile Calculator

A full-stack web application for calculating tile requirements for construction projects. This project features a conversational AI chatbot (powered by Google Gemini) to guide users through the process, a modern React frontend, and a Flask backend for calculations and AI integration.


## 🚀 Features

### 🧮 Tile Calculator Chatbot
- Conversational assistant to guide users step-by-step.
- Calculates the number of tiles and boxes needed based on area and tile size.
- Supports both floor and wall tile calculations.
- Handles area input in Sq.Ft or Sq.M, or by dimensions (length × width).
- Suggests a buffer for wastage (10% standard, 15% checkerboard, 20% mosaic patterns).
- Recommends related tile products based on user selection.

### 🖥️ Modern Frontend
- Built with React and styled for a clean, responsive experience.
- Sidebar with usage instructions and easy steps.
- Product cards for related tiles with images, prices, and links.
- Header with navigation to other ARQONZ tools and account management.
- Footer with company info and app download links.

### ⚙️ Robust Backend
- Flask API for chat and calculation logic.
- Integrates Google Gemini (Generative AI) for natural conversation.
- Handles parsing of user input, area, and tile size in various formats.
- Stateless API endpoint for chatbot interaction.

## 🗂️ Project Structure

```
companyfrontend/      # React frontend (main UI)
  ├── src/
  │   ├── components/  # Chatbot, Header, Footer, Sidebar, ProductCard
  │   └── ...
  ├── public/
  ├── package.json
  └── README.md        # (this file)
app.py                # Flask backend (API & logic)
requirements.txt      # Python dependencies
index.html, style.css, script.js  # (if using static HTML for demo)
```

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ARQONZ
```

### 2. Backend Setup (Flask)
- **Python 3.8+ required**
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Create a `.env` file in the root with your Google Gemini API key:
  ```env
  GOOGLE_API_KEY=your_google_gemini_api_key
  ```
- Start the backend server:
  ```bash
  python app.py
  ```
  The backend runs on [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 3. Frontend Setup (React)
- Go to the frontend directory:
  ```bash
  cd companyfrontend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Start the React app:
  ```bash
  npm start
  ```
  The frontend runs on [http://localhost:3000](http://localhost:3000) and proxies API requests to the Flask backend.

---

## 🧑‍💻 Usage Guide

1. **Select Tile Type:** Choose whether you are calculating for floor or wall tiles.
2. **Enter Area:** Input the total area (in Sq.Ft or Sq.M) or provide dimensions (length × width).
3. **Select Tile Size:** Choose from standard sizes or enter a custom size (e.g., 1200x600 MM).
4. **Get Results:** The chatbot calculates the number of tiles and boxes needed, including a buffer for wastage.
5. **View Suggestions:** See related tile products matching your selection.

**Note:** The chatbot guides you through each step and handles ambiguous input gracefully.

---

## 🛣️ API Endpoints

- `POST /api/chat`  
  - Request: `{ "message": "<user input>" }`
  - Response: `{ "reply": "<bot reply>", "quick_replies": [ ... ], "step": <step_number> }`
  - Stateless; conversation state is managed in-memory per user session.

---

## 🧰 Technologies Used

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **AI Integration:** Google Gemini (Generative AI)
- **Other:** html2pdf.js (for PDF export), dotenv

---

## 📁 Folder Structure (Key Files)

- `app.py` — Flask backend with all calculation and chat logic
- `requirements.txt` — Python dependencies
- `companyfrontend/` — React frontend
  - `src/components/Chatbot.js` — Main chatbot logic
  - `src/components/ProductCard.js` — Product display
  - `src/components/Header.js`, `Footer.js`, `Sidebar.js` — Layout
  - `App.js` — Main React app

---


