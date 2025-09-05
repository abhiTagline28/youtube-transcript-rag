# YouTube RAG App - Authentication Setup

This project now includes complete authentication functionality with MongoDB, JWT tokens, and route protection.

## Features Added

- ✅ User registration and login
- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ HTTP-only cookies for secure token storage
- ✅ Route protection middleware
- ✅ Authentication context for React components
- ✅ Responsive UI for login/signup forms
- ✅ Protected and public route management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/youtube-rag-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Change the JWT_SECRET to a secure random string in production!

### 3. MongoDB Setup

Make sure MongoDB is running on your system:

- **Local MongoDB:** Start MongoDB service
- **MongoDB Atlas:** Use your connection string in MONGODB_URI

### 4. Run the Application

```bash
npm run dev
```

## Authentication Flow

### Public Routes (No Authentication Required)

- `/` - Home page (shows different content based on auth status)
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes (Authentication Required)

- `/api/transcribe` - YouTube transcription API
- Any future protected routes you add

### Route Protection

- Authenticated users are redirected away from login/signup pages
- Unauthenticated users are redirected to login for protected routes
- API routes return 401 for unauthenticated requests

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Protected

- `POST /api/transcribe` - Transcribe YouTube videos (requires authentication)

## User Interface

### For Non-Authenticated Users

- Welcome page with sign in/sign up buttons
- Login and signup forms with validation
- Navigation shows login/signup links

### For Authenticated Users

- Full YouTube transcription functionality
- User name displayed in navigation
- Logout button
- Access to all protected features

## Security Features

- Passwords are hashed with bcryptjs (12 salt rounds)
- JWT tokens stored in HTTP-only cookies
- Secure cookie settings for production
- Middleware-based route protection
- Input validation on all forms

## File Structure

```
youtube-rag-app/
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Main page with auth logic
├── components/
│   ├── auth/              # Login/Signup forms
│   └── Navigation.tsx     # Navigation component
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── auth.ts            # JWT utilities
│   └── mongodb.ts         # Database connection
├── models/
│   └── User.ts            # User schema
└── middleware.ts          # Route protection
```

## Next Steps

1. Set up your MongoDB database
2. Configure environment variables
3. Run the application
4. Test the authentication flow
5. Customize the UI as needed

The authentication system is now fully integrated and ready to use!

