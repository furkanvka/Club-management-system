# Student Club Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Spring Boot](https://img.shields.io/badge/backend-Spring%20Boot%203-brightgreen.svg)
![React](https://img.shields.io/badge/frontend-React-blue.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)

Student Club Management System is a web-based platform designed to empower student organizations. It centralizes member administration, financial tracking, event coordination, and resource management into a single, intuitive interface.

---

## Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Context API

### Backend
- **Framework**: Spring Boot 3
- **Language**: Java 21
- **Security**: Spring Security & JWT
- **Database**: PostgreSQL
- **Persistence**: Spring Data JPA

---

## Project Structure

```text
app/
├── backend/          # Spring Boot Application
├── frontend/         # React Application
```

---

## Setup and Installation

### Prerequisites & Installation

Before you begin, ensure you have the following installed. Follow the links for installation guides:

1.  **Docker Desktop**
    - [Download & Install Docker](https://www.docker.com/products/docker-desktop/)
    - Verify: `docker --version` and `docker-compose --version`

2.  **Java Development Kit (JDK) 21**
    - [Download Adoptium Temurin 21 (Open source)](https://adoptium.net/temurin/releases/?version=21)
    - **Linux (Ubuntu/Debian)**: `sudo apt install openjdk-21-jdk`
    - Verify: `java -version`

3.  **Node.js (LTS)**
    - [Download Node.js](https://nodejs.org/)
    - **Linux**: Use `nvm` or `sudo apt install nodejs npm`
    - Verify: `node -version` and `npm -version`

4.  **Maven**
    - [Download Maven](https://maven.apache.org/download.cgi)
    - **Linux**: `sudo apt install maven`
    - Verify: `mvn -version`

---

### Running with Docker

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

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
