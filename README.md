# Bhoomi Setu AI

Bhoomi Setu AI is a prototype for digitizing and validating land records. It combines a React dashboard with an Express API, MongoDB-backed records, document uploads, validation workflows, and role-based demo access.

## Features

- Upload and review land record documents
- Indic OCR and extraction workflow demonstrations
- Rule-based validation and officer verification queue
- District progress dashboard, audit log, and API views
- Hindi, English, Marathi, Tamil, Telugu, and Bengali interface options

## Requirements

- Node.js 18 or newer
- npm
- MongoDB (optional for local demo; the server falls back to an in-memory MongoDB instance)

## Run locally

From the repository root, install the client and server dependencies:

```powershell
npm run install-all
```

Start the API in one terminal:

```powershell
npm run dev:server
```

Start the web client in another terminal:

```powershell
npm run dev:client
```

Open <http://localhost:3000>. The Vite development server proxies API requests to `http://localhost:5000`.

The server seeds demo data automatically when it connects to an empty database. Demo accounts use the password `Bhoomi@2026`:

| Role | Email |
| --- | --- |
| Administrator | `admin@bhoomi.gov.in` |
| District officer | `district@bhoomi.gov.in` |
| Verification officer | `officer@bhoomi.gov.in` |
| Viewer | `viewer@bhoomi.gov.in` |

These are prototype credentials; do not use them for a deployed service.

## Configuration

The API reads environment variables from `server/.env`. Copy `server/.env.example` to `server/.env` to configure a local MongoDB connection, port, or JWT signing secret. Without `MONGODB_URI`, the API tries local MongoDB and then starts an in-memory database.

Never commit `.env` files or production secrets. Set a unique, high-entropy `JWT_SECRET` before deploying. Uploaded documents are stored locally under `uploads/`; that directory is ignored by Git and should be backed up or replaced with managed storage for a deployment.

## Build

```powershell
npm run build
```

## Repository layout

```text
client/   React, TypeScript, Vite, and Tailwind dashboard
server/   Express API, MongoDB models, and workflow services
shared/   Shared TypeScript types and master data
uploads/  Local uploaded documents (not tracked by Git)
```

## Notes

- `npm run seed` resets the connected database before inserting demo data. Use it only with a disposable development database.
- This is a prototype and is not an official Government of India or UIDAI service.
- No license is included. Add one only after deciding how you want the project to be licensed.
