# Medical Billing Claim Denial Appeal Agent

A local development workspace for claim tracking with a Next.js App Router frontend and an Express, MongoDB, and Mongoose API. This phase includes registration/login, JWT-protected claims CRUD, ownership-based access, pagination and filtering, and private PDF uploads. AI appeal generation is intentionally not enabled.

> **Development use only:** Do not upload real patient health information or production claim documents. This prototype has not undergone a HIPAA or production security/compliance review.

## Requirements

- Node.js 20+
- npm
- MongoDB Community Server or a MongoDB-compatible URI

## Setup

1. Start MongoDB locally, or obtain a development database URI.
2. Configure the API:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Set `MONGO_URI` and provide a unique JWT signing secret of at least 32 characters. For local development, create one with:

   ```bash
   openssl rand -base64 32
   ```

3. Configure the frontend:

   ```bash
   cd ../frontend
   cp .env.example .env.local
   ```

4. Install dependencies in each app and run them in separate terminals:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create an account, and add claims. The API health check is [http://localhost:5000/api/health](http://localhost:5000/api/health).

Uploaded claim PDFs are stored in `backend/uploads/claims` with generated filenames and are not served as public static files. They are only returned through an authenticated, ownership-checked document endpoint.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection URI. |
| `JWT_SECRET` | Yes | JWT signing secret, at least 32 characters. |
| `FRONTEND_ORIGIN` | No | Browser origin allowed by CORS; defaults to `http://localhost:3000`. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | API base URL; defaults to `http://localhost:5000/api`. |

Do not put JWT secrets or other server credentials in frontend environment variables.

## API

All responses use `{ "success": boolean, "data"?: ..., "error"?: string }`. Protected endpoints require `Authorization: Bearer <token>`. Registration and login return a JWT and the public user profile.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account. JSON: `name`, `email`, `password`. |
| `POST` | `/api/auth/login` | Sign in. JSON: `email`, `password`. |
| `GET` | `/api/auth/me` | Get the authenticated profile. |
| `GET` | `/api/claims` | List owned claims. Optional `page`, `limit` (1–100), `search`, `status` (one or comma-separated values), and `sort=newest\|oldest` query parameters. |
| `GET` | `/api/claims/stats` | Owned-claim totals for the dashboard. |
| `POST` | `/api/claims` | Create a claim; accepts JSON or `multipart/form-data` with an optional `document` PDF field. |
| `GET` | `/api/claims/:id` | Get one owned claim. |
| `PUT` | `/api/claims/:id` | Update an owned claim; accepts JSON or multipart data, including an optional replacement `document`. |
| `DELETE` | `/api/claims/:id` | Delete an owned claim and its uploaded PDF. |
| `GET` | `/api/claims/:id/document` | Preview an owned claim’s PDF. |
| `GET` | `/api/health` | API health check. |

The claim upload endpoint accepts PDF files up to 10 MB. It checks the PDF content signature, uses a generated storage name, and keeps the original filename as display metadata.

## Validation

```bash
cd backend && npm run build
cd ../frontend && npm run typecheck && npm run lint && npm run build
```
