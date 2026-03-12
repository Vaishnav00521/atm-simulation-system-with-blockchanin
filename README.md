🌐 Global ATM Blockchain & Agentic AI System
An enterprise-grade, full-stack Web3 ATM platform featuring Lisa, a multi-lingual Agentic AI capable of executing secure financial transactions through natural language processing. Built with a robust Spring Boot backend, a React/Vite frontend, and fully containerized with Docker.

✨ Key Features
🤖 Agentic AI Router (Lisa): An integrated NLP assistant that processes natural language commands (e.g., "Transfer 500 USDC") and securely routes them to alter the database ledger in real-time.

🌍 Multi-Lingual Support: The AI natively processes and responds to commands in English, Hindi, Marathi, and Gujarati.

🔐 Enterprise Security: Implements Spring Security with stateless JWT (JSON Web Token) authentication to protect API endpoints and user sessions.

💼 Dual-Ledger System: Tracks and manages both traditional Fiat Reserves (USD) and Web3 Crypto Vaults (ETH, USDC) simultaneously.

🐳 Fully Containerized: Engineered with Docker and Docker Compose for seamless, environment-agnostic deployment of the Java microservice and MySQL database.

⚡ Modern UI/UX: A highly responsive, sleek React frontend animated with Framer Motion and styled with Tailwind CSS.

🛠️ Tech Stack
Backend (Microservice)

Java 21

Spring Boot 3.5.x (Web, Data JPA, Security)

Hibernate / Spring Data JPA

JWT (jjwt) for Authentication

MySQL 8.0

Frontend (Client)

React.js (Vite)

Tailwind CSS

Framer Motion (Animations)

Lucide React (Icons)

Axios (with dynamic token interceptors)

DevOps & Deployment

Docker & Docker BuildKit

Docker Compose

Maven

📂 Project Architecture
Plaintext
global-atm-system/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/...     # Controllers, Services, Models, Security Filters
│   ├── Dockerfile            # Multi-stage Docker build for the Java App
│   └── docker-compose.yml    # Orchestrates MySQL DB and Backend container
└── frontend/                 # React Vite Application
    ├── src/components/       # UI Components (LisaAI, Sidebar, etc.)
    ├── src/pages/            # Dashboard, Wallet, Contracts, etc.
    └── src/api/              # Axios configuration & interceptors
🚀 Getting Started
Prerequisites
Java JDK 21+

Node.js (v18+)

Docker Desktop (Optional, but recommended)

MySQL Workbench (If running locally without Docker)

Option 1: Running via Docker (Recommended)
This spins up both the MySQL database and the Spring Boot backend in an isolated, secure network.

Navigate to the backend directory.

Run the Docker Compose stack:

Bash
docker compose up -d
The backend will be available at http://localhost:8080.

Option 2: Running Locally (Manual Setup)
Ensure your local MySQL server is running.

Update src/main/resources/application.properties with your database credentials:

Properties
spring.datasource.url=jdbc:mysql://localhost:3306/atm_blockchain
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
Run the Spring Boot application using Maven or your IDE (IntelliJ).

Frontend Setup
Open a new terminal and navigate to the frontend directory.

Install the dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Access the application at http://localhost:5173.

🤖 How the Agentic AI Works
Lisa is not just a chatbot; she is an agentic routing service.

The user inputs a command in the React UI (via typing or Voice Recognition).

The Axios interceptor securely attaches the user's active JWT.

The Spring Boot AiController receives the request and passes it to the LisaAgentService.

The service parses the NLP intent, cross-references the user's active balances from the database, executes risk-management logic (e.g., checking for insufficient funds), updates the MySQL ledger, and returns a localized response.

Author Made by Vaishnav
