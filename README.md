# 🚀 COMP3123 Full Stack Assignment

**Course:** Full Stack Development II (COMP3123)  
**Professor:** Abid Rana  
**Student:** Jon Adrian Lee  
**Student ID:** 101421575

---

## 📋 Project Overview

This is a full-stack Employee Management System built with:
- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React.js with Material-UI
- **State Management:** TanStack Query (React Query)
- **Authentication:** JWT tokens stored in localStorage
- **File Upload:** Multer for profile picture uploads

---

## 🏗️ Project Structure

```
101421575_comp3123_assignment/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── uploads/ (created automatically)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── contexts/
│       └── services/
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 101421575_comp3123_assignment
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - MongoDB Express: http://localhost:8081

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/comp3123_assigment1
   JWT_SECRET=your-secret-key
   ```

4. **Start MongoDB** (if not using Docker):
   ```bash
   mongod
   ```

5. **Run the backend:**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:3000
   ```

4. **Run the frontend:**
   ```bash
   npm start
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000

---

## 📡 API Endpoints

### User Endpoints

- `POST /api/v1/user/signup` - Create a new user account
- `POST /api/v1/user/login` - Login and get JWT token

### Employee Endpoints

- `GET /api/v1/emp/employees` - Get all employees
- `GET /api/v1/emp/employees/:id` - Get employee by ID
- `POST /api/v1/emp/employees` - Create new employee (with file upload)
- `PUT /api/v1/emp/employees/:id` - Update employee (with file upload)
- `DELETE /api/v1/emp/employees?eid=xxx` - Delete employee
- `GET /api/v1/emp/employees/search?department=xxx&position=xxx` - Search employees

**Note:** All employee endpoints require authentication (Bearer token in Authorization header).

---

## 🎨 Features

### Authentication
- ✅ User signup with validation
- ✅ User login with JWT token
- ✅ Protected routes
- ✅ Session management with localStorage
- ✅ Logout functionality

### Employee Management
- ✅ List all employees in a table
- ✅ Add new employee with profile picture upload
- ✅ View employee details
- ✅ Update employee information with profile picture
- ✅ Delete employee
- ✅ Search employees by department or position

### UI/UX
- ✅ Material-UI design system
- ✅ Responsive layout
- ✅ Form validation with error messages
- ✅ Loading states
- ✅ Professional styling

---

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

---

## 📝 Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/comp3123_assigment1
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:3000
```

---

## 🧪 Testing

1. **Signup:** Create a new account
2. **Login:** Use your credentials to login
3. **Add Employee:** Create employees with profile pictures
4. **View/Update/Delete:** Test CRUD operations
5. **Search:** Test search by department or position

---

## 📦 Dependencies

### Backend
- express
- mongoose
- bcrypt
- jsonwebtoken
- multer
- express-validator
- cors
- dotenv

### Frontend
- react
- react-router-dom
- @tanstack/react-query
- axios
- @mui/material
- @mui/icons-material

---

## 🚨 Troubleshooting

1. **MongoDB connection issues:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - For Docker, ensure mongodb service is up

2. **File upload issues:**
   - Check uploads directory exists
   - Verify file size is under 5MB
   - Ensure file is an image (jpg, png, gif)

3. **CORS issues:**
   - Verify REACT_APP_BACKEND_URL matches backend URL
   - Check backend CORS configuration

---

## 📄 License

This project is created for educational purposes as part of COMP3123 course.

---

## 👤 Author

**Jon Adrian Lee**  
Student ID: 101421575

