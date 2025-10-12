# 🧩 COMP3123 — Assignment 1 (Backend)

**Course:** Full Stack Development II (COMP3123)  
**Professor:** Abid Rana  
**Student:** Jon Adrian Lee  
**Student ID:** 101421575  
**Submission Date:** October 12, 2025  

---

Implements the required **RESTful API** using **Node.js**, **Express**, and **MongoDB**.

> **Database Name:** `comp3123_assigment1`  
> **GitHub Repository:** [101421575_COMP3123_Assignment1]https://github.com/MfLeeAlvaro/101421575_comp3123_Assignment1

---

## ⚙️ Endpoints & Status Codes

- **POST** `/api/v1/user/signup` → `201 Created`
- **POST** `/api/v1/user/login` → `200 OK`
- **GET** `/api/v1/emp/employees` → `200 OK`
- **POST** `/api/v1/emp/employees` → `201 Created`
- **GET** `/api/v1/emp/employees/{eid}` → `200 OK`
- **PUT** `/api/v1/emp/employees/{eid}` → `200 OK`
- **DELETE** `/api/v1/emp/employees?eid=xxx` → `204 No Content`

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-github-username/101421575_COMP3123_Assignment1.git
cd 101421575_COMP3123_Assignment1

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Set your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/comp3123_assigment1

# 5. Run the development server
npm run dev
