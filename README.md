# ResumeAI — Full-Stack AI-Powered Resume Builder

ResumeAI is a premium, full-stack, AI-powered resume builder designed to help job seekers pass applicant tracking systems (ATS) and craft highly tailored applications.

## 🚀 Features

- **Dynamic Resume Builder:** Split accordion-style form editor with responsive, live A4 preview.
- **AI Tailoring (Claude 3.5 Sonnet):** Rewrite and refine individual sections or generate entire resumes from a job title and description.
- **ATS Checker Dashboard:** Interactive conic-gradient score gauge measuring keyword matching, displaying matched vs missing keywords side-by-side.
- **CV File Uploading:** Drag-and-drop or upload existing PDF/TXT resume files to parse and check their ATS score dynamically.
- **Cover Letter Generator:** Custom AI cover letter generation linked to your saved CV templates, including options to copy, save, and download as PDF.
- **Template Library:** Selection of premium templates: Modern, Classic, Minimal, and ATS-Safe layouts.
- **Database Storage:** User accounts with secure authentication and database persistence.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (matching custom design system tokens)
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form + Zod
- **State Management:** Zustand
- **Notifications:** React Hot Toast
- **PDF Generation:** Client-side HTML5 canvas previews via html2canvas

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Database & ORM:** MySQL + Prisma ORM
- **AI Service:** `@anthropic-ai/sdk` (Claude claude-sonnet-4-6)
- **PDF Exporter:** Server-side PDF rendering using Puppeteer
- **Authentication:** JWT (httpOnly cookies for refresh tokens + memory access tokens)
- **Security:** Helmet, CORS, Express Rate Limit, bcrypt

---

## 📦 Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18 or higher)
- **MySQL** (v8 or higher)

---

## ⚙️ Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd ResumeAI
   ```

2. **Backend Setup (`/server`):**
   - Navigate to the server folder:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure Environment Variables:
     Create a `.env` file from the example:
     ```bash
     cp .env.example .env
     ```
     Open `.env` and fill in your details:
     ```ini
     DATABASE_URL="mysql://root:password@localhost:3306/resumeai"
     JWT_SECRET="your-32+-character-secret"
     JWT_REFRESH_SECRET="your-refresh-token-secret"
     ANTHROPIC_API_KEY="your-anthropic-api-key"
     CLIENT_URL="http://localhost:5173"
     PORT=3000
     NODE_ENV=development
     ```
   - Run Database Migrations:
     ```bash
     npm run prisma:migrate
     npm run prisma:generate
     ```
   - Start Server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup (`/client`):**
   - Open a new terminal in the root folder and navigate to the client:
     ```bash
     cd client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure Environment Variables:
     Create a `.env` file:
     ```bash
     cp .env.example .env
     ```
     Verify that `VITE_API_URL` is pointing to the Express server:
     ```ini
     VITE_API_URL="http://localhost:3000/api"
     ```
   - Start Frontend Dev Server:
     ```bash
     npm run dev
     ```

---

## 🔗 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Authenticate user & get tokens | No |
| **POST** | `/api/auth/refresh` | Refresh access token | No |
| **POST** | `/api/auth/logout` | Clear refresh token cookies | No |
| **GET** | `/api/auth/me` | Fetch active user credentials | Yes |
| **GET** | `/api/resumes` | List all resumes belonging to user | Yes |
| **POST** | `/api/resumes` | Create a new resume | Yes |
| **GET** | `/api/resumes/:id` | Get details of a single resume | Yes |
| **PUT** | `/api/resumes/:id` | Update resume contents (auto-save) | Yes |
| **DELETE**| `/api/resumes/:id` | Delete resume | Yes |
| **POST** | `/api/resumes/:id/duplicate`| Duplicate resume | Yes |
| **GET** | `/api/resumes/:id/pdf` | Stream Puppeteer PDF output | Yes |
| **POST** | `/api/ai/generate` | Generate resume draft based on job details | Yes |
| **POST** | `/api/ai/improve-section` | Optimize a section using missing keywords | Yes |
| **POST** | `/api/ai/ats-check` | Check score and keywords for saved CV | Yes |
| **POST** | `/api/ai/ats-check-file` | Parse PDF/TXT file and return ATS score | Yes |
| **POST** | `/api/ai/cover-letter` | Generate AI cover letter text | Yes |

---

## 📂 Project Structure

```text
resumeai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/          # Axios wrappers
│   │   ├── components/   # UI widgets, layout, resume cards
│   │   ├── hooks/        # auto-save, auth bootstraps
│   │   ├── pages/        # Dashboard, Settings, ATS, letters
│   │   ├── store/        # Zustand global state modules
│   │   └── types/        # TypeScript interfaces
│   ├── index.html
│   └── tailwind.config.ts
│
├── server/
│   ├── src/
│   │   ├── controllers/  # Route controller actions
│   │   ├── middleware/   # Rate limiter, auth validator
│   │   ├── prisma/       # Database schema definition
│   │   ├── routes/       # API endpoints definitions
│   │   └── services/     # Claude API & Puppeteer PDF rendering
│   └── index.ts
```

---

## 📄 License
This project is licensed under the MIT License.
