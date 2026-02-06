# HRMS Lite 
**Live Link:** https://hrms-frontend-shivam.netlify.app/  
**Backend URL:** https://hrms-project-n22s.onrender.com/

A web-based HR Management System for managing employee records and tracking daily attendance.

## Features

- **Employee Management**
  - Add new employees (Full Name, Email, Department)
  - View all active employees
  - Remove (deactivate) employees

- **Attendance Management**
  - Mark attendance by date (Present / Absent)
  - Bulk attendance marking for multiple employees
  - View individual employee attendance calendar
  - Track present/absent day statistics

## NOTE
   - The page might not show data for about 30-40 seconds of page load.
   - Since I am using free tier of render for backend services. Page might not show data for about a min, since backend services are being redeployed after 15 minutes of inactivity or more.

## Assumptions
   - Deleted Employee info can only be viewed from Manage Attendance -> Employee Attendance Details
   - Employee is only shown for attendance if he's not deleted and was create before or on the same date

## Tech Stack

### Frontend
- React 18
- Material UI (MUI)
- MUI X Data Grid
- FullCalendar (for attendance calendar)
- Formik + Yup (form handling & validation)
- React Router DOM

### Backend
- Django 6.0
- Django REST Framework
- SQLite (development)
- django-cors-headers

## Project Structure

```
├── src/                    # React frontend
│   ├── api/                # API service functions
│   ├── components/         # Reusable components
│   ├── scenes/             # Page components
│   │   ├── employees/      # Manage Employees page
│   │   ├── attendance/     # Mark Attendance & Employee Details
│   │   └── global/         # Sidebar & Topbar
│   ├── App.js
│   ├── theme.js            # MUI theme & color tokens
│   └── index.js
├── public/                 # Static assets
├── backend/                # Django backend
│   ├── api/                # Django app (models, views, urls)
│   ├── hrms/               # Django project settings
│   ├── manage.py
│   └── requirements.txt
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

### Frontend Setup

```bash
npm install
npm start
```

Frontend runs at `http://localhost:5000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/employee-list/` | GET | List all active employees |
| `/api/employee-add/` | POST | Add new employee |
| `/api/employee-remove/` | POST | Deactivate employee |
| `/api/attendance-by-date/` | POST | Get employees with attendance for a date |
| `/api/employeeAttendance-set/` | POST | Set attendance status |
| `/api/employeeAttendance-list/` | POST | Get attendance records for an employee |
| `/api/employeeAttendance-days/` | POST | Get present/absent day counts |

## Deployment

As per the assignment, the application must be deployed and the following shared:

| Item | URL |
|------|-----|
| **Live Application URL** | _Add your frontend URL after deploying_ |
| **Hosted Backend API** | _Add your backend API URL after deploying_ |
| **GitHub Repository** | _Add your repo link, e.g. https://github.com/yourusername/HRMS_ |

### Deploy Backend (Render) — manual (no Blueprint, no payment required)

**Do not use "Blueprint"** — that flow may ask for payment. Create a **Web Service** manually:

1. Push this repo to GitHub.
2. Go to [Render](https://render.com) and sign in. Click **New +** → **Web Service**.
3. Connect your GitHub account if needed, then select this repository.
4. Configure the service:
   - **Name:** `hrms-backend` (or any name)
   - **Region:** choose one
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend` — **important:** type `backend` so Render runs from the backend folder
   - **Runtime:** `Python 3`
   - **Build Command:** `./build.sh` (or `pip install -r requirements.txt && python manage.py migrate --noinput`)
   - **Start Command:** `gunicorn hrms.wsgi --bind 0.0.0.0:$PORT`
   - **Instance Type:** leave as **Free**
5. Click **Advanced** and add **Environment Variables**:
   - `DJANGO_SECRET_KEY` = any long random string (e.g. generate one at [djecrety.ir](https://djecrety.ir/))
   - `DJANGO_DEBUG` = `false`
   - `CORS_ORIGINS` = your frontend URL later (e.g. `https://your-app.vercel.app`) — you can add this after deploying the frontend
6. Click **Create Web Service**. Wait for the first deploy.
7. Copy the service URL (e.g. `https://hrms-backend-xxxx.onrender.com`). Your API base URL is that + `/api` (e.g. `https://hrms-backend-xxxx.onrender.com/api`).
8. After you deploy the frontend, go back to Render → your service → **Environment** and set **CORS_ORIGINS** to your frontend URL (no trailing slash).

The app uses SQLite on ephemeral disk (data resets on redeploy). No database or payment is required.

### Deploy Frontend (Vercel or Netlify)

1. **Vercel**
   - Go to [Vercel](https://vercel.com), import your GitHub repo.
   - **Root Directory** = project root (frontend at root).
   - Add **Environment Variable**: `REACT_APP_API_URL` = your backend API base URL (e.g. `https://hrms-backend-xxxx.onrender.com/api`).
   - Deploy. Your app will be at `https://your-project.vercel.app`.

2. **Netlify**
   - Go to [Netlify](https://netlify.com), **Add new site** → **Import from Git** → select repo.
   - **Build command**: `npm run build`. **Publish directory**: `build`.
   - Add **Environment variable**: `REACT_APP_API_URL` = your backend API base URL.
   - Deploy.

3. After frontend is live, set **CORS_ORIGINS** on Render to your frontend URL (see step 4 under Backend).

### Local development with production API

Create a `.env` in the project root (see `.env.example`):

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

Then run `npm start`; the app will use the deployed backend.

## License

MIT
