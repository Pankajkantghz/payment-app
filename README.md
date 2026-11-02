# Payment App

A full-stack sample wallet for practicing account and transfer flows. Create an account, add clearly labeled demo funds, find another user, review a transfer before sending it, and search transaction history with receipts.

> **Demo only:** this application does not connect to a bank, card network, or payment provider. Balances and transfers are sample data. No real money moves. Do not enter real financial or sensitive personal information.

## Features

- Email sign-up and sign-in with password hashing and JWT authentication
- Wallet balances and transaction amounts stored as integer paise to avoid floating-point rounding
- Search for other users and select a recipient
- Review the recipient, transfer amount, and estimated remaining balance before confirming
- Atomic transfers with insufficient-balance checks
- Demo-only top-ups and a sample recipient for local development
- Recent transaction history with sent, received, and demo-funding filters
- Expandable receipts with unique reference IDs and copy-to-clipboard
- Responsive dashboard and inline form feedback
- Startup migration for legacy rupee-based balances and activity records

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express, Mongoose, MongoDB, Zod, JSON Web Tokens |

## Project structure

```text
payment-app/
├── backend/
│   ├── middlewares/       # Authentication middleware
│   ├── routes/            # User and account API endpoints
│   ├── config.js          # Environment configuration
│   ├── db.js              # Models, database connection, and migrations
│   └── index.js           # Express app and server startup
├── frontend/
│   ├── public/            # Static assets and app icon
│   └── src/
│       ├── app/           # Router and route protection
│       ├── components/    # Shared layout and UI components
│       ├── features/
│       │   ├── auth/      # Sign-in and sign-up screens
│       │   ├── dashboard/# Wallet overview
│       │   ├── people/    # Recipient search
│       │   ├── transactions/ # Activity and receipts
│       │   └── transfers/ # Send and confirm flow
│       └── lib/           # Shared API client
└── README.md
```

## Requirements

- Node.js 20.6 or newer
- npm
- MongoDB configured as a replica set, or MongoDB Atlas

MongoDB replica sets are required because transfers use database transactions to debit and credit both accounts together. For a local development database, start MongoDB in replica-set mode:

```bash
mongod --replSet rs0 --bind_ip localhost
```

Then initialize the replica set once in another terminal:

```bash
mongosh --eval "rs.initiate()"
```

At startup, the backend converts legacy rupee-based balance and activity records to integer paise before accepting requests. The API continues to accept and return amounts in rupees.

## Run locally

### 1. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Set a private `JWT_SECRET` of at least 32 characters in `backend/.env`. Keep `.env` out of version control. The backend connects to the MongoDB URI configured by `MONGODB_URI` and listens on port `3000` by default.

For the local demo controls, set `ENABLE_DEMO_FUNDING=true` in `backend/.env`. Demo top-ups and the demo recipient endpoint are disabled unless this is explicitly enabled.

```bash
npm run dev
```

### 2. Configure and start the frontend

Open another terminal at the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

To show the local **Add demo funds** and **Create demo recipient** controls, create `frontend/.env.local` with:

```env
VITE_ENABLE_DEMO_FUNDING=true
```

The frontend control and backend endpoint must both be enabled. Restart Vite after changing the environment file. Demo top-ups are capped at ₹100,000 per request and are not real deposits.

To use another API URL, add this to `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Try a transfer

1. Create an account and sign in.
2. Add demo funds to your local wallet.
3. Search for another account or create the local demo recipient.
4. Choose **Send**, review the amount and recipient, then confirm.
5. Return to the dashboard to find the transaction and its receipt.

New accounts start with a zero balance. The sample recipient also starts with zero balance; it is intended for testing outgoing transfers.

## API overview

All routes use the `/api/v1` prefix. Authenticated routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/user/signup` | No | Create an account and zero-balance wallet |
| `POST` | `/user/signin` | No | Sign in and receive a JWT |
| `GET` | `/user/me` | Bearer token | Return the signed-in user's profile |
| `GET` | `/user/bulk?filter=name` | Bearer token | Search other users |
| `GET` | `/account/balance` | Bearer token | Return the current balance |
| `GET` | `/account/transactions` | Bearer token | Return the latest 50 transfers and demo top-ups |
| `POST` | `/account/transfer` | Bearer token | Transfer demo funds to another account |
| `POST` | `/account/demo-funds` | Bearer token; demo flag required | Add local sample funds |
| `POST` | `/account/demo-recipient` | Bearer token; demo flag required | Create or return the sample recipient |

Transfer request example:

```json
{
  "to": "recipient-user-id",
  "amount": 25.5
}
```

Amounts use rupees in API requests and responses, support up to two decimal places, and are stored internally as integer paise.

## Development commands

```bash
# Frontend production build and lint
cd frontend
npm run build
npm run lint
```

## Security and scope

- This is an educational demo, not a payment service or production banking system.
- Do not deploy with demo funding enabled or use real money or personal data.
- Keep JWT secrets private and use a dedicated development database.
- Passwords for new accounts are hashed with Node.js `scrypt`. Existing legacy plaintext passwords are upgraded to hashes after a successful sign-in.
- JWTs expire after seven days.
