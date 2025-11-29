# Leave Request Management — SAPUI5 + Spring Boot

A full-stack Leave Management application where:

- **Employees** can create, view, and cancel leave requests
- **Managers** can approve or reject pending requests
- **Frontend** is built using **SAPUI5**
- **Backend** is built using **Java (Spring Boot)** and exposes **OData/REST APIs**

This README contains everything needed to set up and run the project locally.

---

## 📌 Problem Statement

Organizations require a simple workflow to handle employee leaves:

### Employees:

- Create leave requests
- View their own leave data
- Cancel pending requests

### Managers:

- View all pending leave requests for employees under them
- Approve or reject leave requests
- Add comments during approval/rejection

This application provides a clean UI and backend workflow to support these operations.

---

# 🏗️ Local Development Setup

The project contains:

backend/ → Java Spring Boot (OData/REST APIs)
app/ → SAPUI5 Frontend Application

Follow the steps below.

---

# 🚀 Backend Setup (Spring Boot + Maven)

### 1️⃣ Build the backend application

mvn clean install

### 3️⃣ Run the backend
mvn spring-boot:run

### The backend should now be running at:

http://localhost:8080/

# 🎨 Frontend Setup (SAPUI5)
### 1️⃣ Navigate to the UI5 application folder
cd app

### 2️⃣ Install dependencies
npm install

### 3️⃣ Start the UI5 development server
npx ui5 serve --config=ui5.yaml --port=8081 --open "index.html"

### The SAPUI5 app will now be available at:

http://localhost:8081/index.html
