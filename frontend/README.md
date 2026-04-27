# EEGFilterPro Web Frontend

This is the newly developed web React frontend for the EEGFilterPro application.
The design has been modernized with a professional, light-purple clinical theme, incorporating glassmorphism, dynamic animations, and interactive elements.

## Prerequisites

You need to have **Node.js** installed on your system to run this web application.

1. Download and install Node.js from [nodejs.org](https://nodejs.org/).
2. Restart your terminal (or VS Code) so your `PATH` is updated.

## Getting Started

Follow these steps to run the frontend server:

1. Open your terminal and navigate to this folder:
   ```bash
   cd "frontend"
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```
   *(This will install React, Vite, Lucide React icons, and React Router)*

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be running on `http://localhost:3000`. Open this in your browser!

## Backend Connection

The API calls to the existing FastAPI backend are configured in `src/api.js`. 
Ensure your Python backend server is running concurrently (using `uvicorn main:app --reload` or your batch equivalent) on `http://127.0.0.1:8000`.

The Web app connects to `http://127.0.0.1:8000` for login and profile updates.
