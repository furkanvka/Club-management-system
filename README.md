# Student Club Management System 🏢

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Spring Boot](https://img.shields.io/badge/backend-Spring%20Boot%203-brightgreen.svg)
![React](https://img.shields.io/badge/frontend-React-blue.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)

Student Club Management System is a robust web-based platform designed to empower student organizations. It centralizes member administration, financial tracking, event coordination, and resource management into a single, intuitive interface.

---

## 🚀 Key Features

- **👤 Member Management**: Track member roles, status, and participation history.
- **💰 Finance Management**: Monitor income, expenses, and budget allocations for each club.
- **📅 Event Organization**: Plan, schedule, and manage event registrations and attendance.
- **📂 Resource & Document Management**: Securely store and share meeting minutes, reports, and digital assets.
- **🛡️ Secure Authentication**: JWT-based authentication for secure access control.
- **📊 Interactive Dashboard**: Real-time insights into club activities and metrics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Networking**: Axios

### Backend
- **Framework**: Spring Boot 3
- **Language**: Java 17
- **Security**: Spring Security & JWT
- **Database**: PostgreSQL
- **Persistence**: Spring Data JPA

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Server**: Tomcat (embedded)

---

## 📂 Project Structure

```text
Club-management-system/
├── app/
│   ├── backend/          # Spring Boot Application
│   ├── frontend/         # React Application
│   ├── docker-compose.yml # Orchestration configuration
│   └── wireframe.html    # Initial design mockups
├── diagrams/             # Architecture and ER diagrams
├── docs/                 # Documentation files
└── meeting-reports/      # Project progress reports
```

---

## ⚙️ Setup and Installation

### 📋 Prerequisites & Installation

Before you begin, ensure you have the following installed. Follow the links for installation guides:

1.  **Docker Desktop** (Recommended)
    - [Download & Install Docker](https://www.docker.com/products/docker-desktop/)
    - Verify: `docker --version` and `docker-compose --version`

2.  **Java Development Kit (JDK) 17**
    - [Download Adoptium Temurin 17 (Open source)](https://adoptium.net/temurin/releases/?version=17)
    - **Linux (Ubuntu/Debian)**: `sudo apt install openjdk-17-jdk`
    - Verify: `java -version`

3.  **Node.js (LTS)**
    - [Download Node.js](https://nodejs.org/)
    - **Linux**: Use `nvm` or `sudo apt install nodejs npm`
    - Verify: `node -version` and `npm -version`

4.  **Maven** (Optional, project includes `./mvnw`)
    - [Download Maven](https://maven.apache.org/download.cgi)
    - **Linux**: `sudo apt install maven`
    - Verify: `mvn -version`

---

### 🐳 Option 1: Running with Docker (Quick Start)

The easiest way to get started is using Docker Compose.

1.  **Navigate to the app directory**:
    ```bash
    cd app
    ```

2.  **Start the services**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the applications**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8080](http://localhost:8080)
    - **Database**: `localhost:5432`

---

### 💻 Option 2: Local Manual Setup

#### 1. Database Setup
Ensure you have a PostgreSQL instance running and create a database named `mydb`.
Alternatively, run only the database via Docker:
```bash
docker run --name postgres-dev -e POSTGRES_DB=mydb -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres:15
```

#### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd app/backend
   ```
2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

#### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd app/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## 🧪 Testing

The project includes unit, integration, and service-level tests.

### ☕ Backend Tests (JUnit 5)
Run the backend test suite using Maven:
```bash
cd app/backend
./mvnw test
```
*Tests cover: Controllers, Services, Repository layers, and Security configurations.*

### ⚛️ Frontend Tests (Jest & React Testing Library)
Run the frontend tests using npm:
```bash
cd app/frontend
npm test
```
*Tests cover: Component rendering, Auth services, and User flows.*

### 🚦 Service Verification (End-to-End)
Use the included health check script to verify if all infrastructure components are healthy and responding:
```bash
# Ensure services are running before executing
bash check_services.sh
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
