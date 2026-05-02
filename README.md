# FundWisor - Secure Startup Matchmaking Platform

FundWisor is a production-ready, secure platform that connects early-stage entrepreneurs with verified investors, co-founders, and service providers. The platform prioritizes idea protection, structured access, and trust-based interactions.

## 🎯 Core Features

### For Entrepreneurs
- Create and manage startup listings with multi-layer visibility
- Public teaser (problem, sector, funding ask)
- Private details (only after investor approval)
- Control investor access with approval/rejection workflow
- Secure document room with watermarks and access logs
- View investor activity and reliability scores

### For Investors
- Browse startup teasers
- Request access to full ideas
- Sign NDA agreements
- Pay refundable "seriousness deposit"
- Access secure documents with watermarks
- Track access history and timeline
- Build reputation score through activity

### For Admins
- Review startup submissions
- Approve/reject listings
- Monitor users and transactions
- Flag suspicious activity
- View comprehensive analytics
- Manage KYC verifications

## 🏗️ Tech Stack

**Frontend:**
- Next.js 13+ with TypeScript
- React 18+
- TailwindCSS for styling
- React Query for state management
- Context API for authentication

**Backend:**
- Node.js with Express.js
- TypeScript
- PostgreSQL
- JWT authentication
- AWS S3 (mock implementation)

**DevOps:**
- Docker & Docker Compose
- Environment-based configuration
- Production-ready logging

## 📁 Project Structure

```
fundwisor/
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── app.ts          # Express app entry
│   ├── migrations/         # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Next.js React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Next.js pages
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   ├── package.json
│   └── next.config.js
│
└── docs/                   # Documentation
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    └── WORKFLOW_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- PostgreSQL 13+
- Docker (optional)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Role-Based Access Control** - Granular permissions
3. **KYC Verification** - User identity verification
4. **NDA Tracking** - Agreement signatures recorded
5. **Audit Logging** - All actions logged
6. **Document Watermarking** - User ID overlay on documents
7. **Access Expiration** - Time-limited document access
8. **Encrypted Passwords** - bcrypt hashing

## 📊 Database Schema

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete schema details.

## 📚 API Documentation

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for all API endpoints.

## 🔄 Workflow Guide

See [WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md) for detailed workflow explanations.

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fundwisor
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# AWS S3 (Mock)
S3_BUCKET=fundwisor-documents
AWS_REGION=us-east-1

# Payment Gateway
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=FundWisor
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.
