# SupportSphere: AI Customer Support Chatbot

SupportSphere is a full-stack AI customer support solution built specifically for the AI Support Chatbot Challenge. It directly addresses the hackathon brief by providing a multi-lingual (EN/ES) chatbot that intelligently classifies incoming user queries, generates automated, context-aware responses using Google's Gemini AI, and seamlessly integrates with an external helpdesk REST API to create and manage support tickets. The platform is completed by a real-time monitoring dashboard, giving support managers a live overview of ticket volume, classification trends, and chatbot performance, fulfilling every core requirement of the challenge.

### Live Demo

**URL:** [YOUR_DEPLOY_URL](YOUR_DEPLOY_URL)

### Key Features

*   **🤖 AI Chatbot Interface:** A clean, responsive chat interface for users to interact with the support AI.
*   **🎯 Intelligent Ticket Classification:** Uses Google Gemini to analyze user messages and classify them into categories like "Billing," "Technical Support," or "General Inquiry."
*   **⚡ Automated Response Generation:** Provides instant, contextually relevant answers to common questions, reducing the load on human agents.
*   **🌎 Multi-language Support:** Fully supports both English (EN) and Spanish (ES) for user queries and AI responses.
*   **📊 Real-time Monitoring Dashboard:** A comprehensive dashboard displaying key metrics like ticket volume, categories, resolution times, and language distribution.
*   **🔄 Helpdesk API Integration:** Connects to a REST API to create, update, and retrieve support tickets in an external system.

### Architecture Overview

The project is a full-stack application composed of a React frontend and a Node.js/Express backend. The user interacts with the React application, which communicates with the backend via a REST API. The backend orchestrates the core logic: it processes incoming messages, calls the Google Gemini API for ticket classification and response generation, and then interacts with the external Helpdesk API to persist the support ticket. All ticket metadata is stored in a database to power the real-time monitoring dashboard. The entire application is containerized with Docker for easy setup and deployment.

### Architecture Diagram

graph TD
    subgraph "User's Browser"
        A[React Chatbot UI]
        B[React Dashboard UI]
    end

    subgraph "Backend Server (Node.js/Express)"
        C{API Gateway}
        D[Chat Logic]
        E[Dashboard Service]
        F[Helpdesk API Client]
        G[Gemini AI Client]
    end

    subgraph "External Services"
        H[Google Gemini API]
        I[Helpdesk REST API]
    end

    subgraph "Data Store"
        J[(Database)]
    end

    A -- "POST /api/chat" --> C
    B -- "GET /api/dashboard" --> C
    C --> D
    C --> E
    D -- "Classify & Respond" --> G
    D -- "Create Ticket" --> F
    D -- "Log Ticket" --> J
    E -- "Fetch Stats" --> J
    F -- "HTTP Requests" --> I
    G -- "LLM Call" --> H
### Design Decisions

*   **Tech Stack Choice:**
    *   **TypeScript:** Chosen for end-to-end type safety, reducing runtime errors and improving developer experience across the full stack.
    *   **React with Vite:** Vite provides a significantly faster development experience (HMR) and optimized builds compared to Create React App, which is crucial in a time-constrained hackathon.
    *   **Node.js/Express:** A lightweight and powerful choice for the backend, with a massive ecosystem that makes integrating with external APIs (Gemini, Helpdesk) straightforward.
    *   **Google Gemini:** Selected for its strong multi-modal and multi-language capabilities, which are perfect for handling both classification and natural language generation tasks required by the brief.
*   **State Management:** We opted for React's built-in `useState` and `useContext` hooks instead of a larger library like Redux. This simplifies the architecture and reduces boilerplate, which is ideal for a project of this scope.
*   **Real-time Dashboard:** The dashboard data is fetched via periodic polling from the frontend. While WebSockets would provide true real-time updates, polling is simpler to implement, more resilient to connection drops, and sufficient to meet the "real-time" requirement of the hackathon brief without adding unnecessary complexity.
*   **Monolithic Structure:** The frontend and backend are in a single repository. This simplifies the setup and deployment process, which is a major advantage for hackathon judging and reproducibility.

### Performance Considerations

*   **API Latency:** The primary performance bottleneck is the latency of the external Google Gemini API. To mitigate this, the prompt is engineered to be concise and efficient. A potential future improvement would be to implement a caching layer (e.g., Redis) for common queries to provide instant responses.
*   **Frontend Rendering:** The application is split into two main components: the Chatbot and the Dashboard. We use React's lazy loading for the Dashboard component, so the initial bundle size for the user-facing chatbot is minimal, ensuring a fast initial page load.
*   **Backend Scalability:** The backend is designed to be stateless. All state is managed by the database and external APIs. This, combined with Docker containerization, means the application can be easily scaled horizontally by running multiple instances of the backend container behind a load balancer.
*   **Database Queries:** All database queries powering the dashboard are optimized. We have added indexes on `timestamp` and `category` columns in the tickets table to ensure that aggregation queries for generating statistics are fast and efficient, even with a large volume of tickets.

### Tech Stack

*   **Frontend:** React, TypeScript, Vite, TailwindCSS
*   **Backend:** Node.js, Express, TypeScript
*   **AI:** `@google/generative-ai` (Gemini)
*   **Testing:** Jest
*   **Deployment:** Docker

### Setup & Installation

Ensure you have Docker and Docker Compose installed on your machine.

1.  **Clone the repository:**
    git clone <your-repo-url>
    cd <your-repo-name>

2.  **Create an environment file:**
    Create a `.env` file in the root of the project and add the following environment variables:
    # Google AI API Key
    GEMINI_API_KEY=your_google_api_key

    # External Helpdesk API Config
    HELPDESK_API_URL=https://api.example-helpdesk.com
    HELPDESK_API_TOKEN=your_helpdesk_api_token

3.  **Build and run with Docker Compose:**
    This single command will build the images for the frontend and backend and start the containers.
    docker-compose up --build

### How to Run

*   The **Chatbot Application** will be available at `http://localhost:5173`.
*   The **Monitoring Dashboard** will be available at `http://localhost:5173/dashboard`.
*   The **Backend API** will be running on `http://localhost:3000`.

### API Endpoints

The following are the primary endpoints exposed by the backend server.

*   `POST /api/chat`
    *   Accepts a user message and language preference.
    *   **Body:** `{ "message": "string", "language": "en" | "es" }`
    *   **Returns:** The AI-generated response and the classified ticket category.

*   `GET /api/dashboard/stats`
    *   Retrieves aggregated statistics for the monitoring dashboard.
    *   **Returns:** A JSON object with data like `totalTickets`, `ticketsByCategory`, `avgResolutionTime`, etc.

*   `GET /api/tickets`
    *   Retrieves a list of the most recent tickets created.
    *   **Returns:** An array of ticket objects.