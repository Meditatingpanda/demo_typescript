# Spurr AI Assistant 🤖

Welcome to the **Spurr Assignment** project! This is a full-stack application featuring a smart AI customer support agent for "Spurr Store". It's built to help users with shipping, returns, and general inquiries.

I've written this guide to help you get everything set up and running smoothly on your local machine.

---

## 📂 Folder Structure

Here's a quick look at how the project is organized:

```
.
├── backend/                # Express + TypeScript Server
│   ├── prisma/            # Database Schema (SQLite)
│   ├── src/
│   │   ├── controllers/   # Request Handlers (Chat logic)
│   │   ├── services/      # Business Logic (AI, Redis*)
│   │   ├── routes/        # API Routes
│   │   ├── middlewares/   # Error Handling
│   │   └── index.ts       # Entry Point
│   └── package.json
│
├── frontend/               # React + Vite Client
│   ├── src/
│   │   ├── components/    # UI Components (ChatWindow, etc.)
│   │   └── hooks/         # Custom Hooks (useChat)
│   └── package.json
│
└── README.md
```

> **Note**: You might see some Redis code in the backend. It's there for future scalability but is currently disabled to keep things simple for local development!

---

## 🚀 How to Run Locally

Follow these steps to get the app running. You'll need `Node.js` installed.

### 1. Backend Setup

First, let's get the server and database ready.

1.  **Navigate to the backend folder**:

    ```bash
    cd backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` directory with the following keys:

    ```env
    # backend/.env
    PORT=3000
    DATABASE_URL="file:../dev.db"  # Path to your SQLite DB
    GEMINI_API_KEY="your_google_gemini_api_key"
    ```

4.  **Setup Database**:
    We use **Prisma** with **SQLite**. Run the following to generate the client and push the schema to your local DB:

    ```bash
    npm run prisma:generate
    npm run prisma:push
    ```

    _(Optional)_ To view your data in a GUI:

    ```bash
    npm run prisma:studio
    ```

5.  **Start the Server**:
    ```bash
    npm run dev
    ```
    The server should now be running on `http://localhost:3000`.

### 2. Frontend Setup

Now for the user interface.

1.  **Open a new terminal** and navigate to the frontend folder:

    ```bash
    cd frontend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    Open the link shown (usually `http://localhost:5173`) to chat with the agent!

---

## 🏗 Architecture Overview

### Backend Design

I structured the backend using a clean, layered architecture to keep code modular and testable:

- **Controllers (`src/controllers`)**: Handle incoming HTTP requests and responses. The `ChatController` manages message history and streaming responses.
- **Services (`src/services`)**: Contains the core business logic.
  - `agent.service.ts`: Handles all interactions with the LLM (Google Gemini).
- **Routes (`src/routes`)**: Defines the API endpoints (e.g., `/api/chat`).
- **Database**: I chose **SQLite** for simplicity in this demo, accessed via **Prisma ORM** for type-safe database queries.

### Interesting Design Decisions

- **Server-Sent Events (SSE)**: To make the chat feel real-time and responsive, the AI's response is streamed to the frontend character-by-character using SSE, rather than waiting for the full generation to complete.
- **Context Management**: The chat history is retrieved from the database and passed to the LLM so it "remembers" the conversation context (limited to the last 20 messages for efficiency).

---

## 🧠 LLM Notes

### Provider

I used **Google's Gemini** (specifically the `gemini-flash-latest` model) via the `@google/genai` SDK. It's fast and cost-effective for real-time chat.

### Prompting Strategy

The agent is prompted with a **System Instruction** that defines its persona and knowledge base.

- **Persona**: "Helpful customer support agent for Spurr Store".
- **Knowledge**: It is explicitly taught about:
  - Shipping policies (Standard: 5-7 days, Express: 2-3 days).
  - Return policies (30-day window).
  - Support hours (Mon-Fri, 9am - 5pm EST).

You can see (and tweak!) this prompt in `backend/src/services/agent.service.ts`.

---


