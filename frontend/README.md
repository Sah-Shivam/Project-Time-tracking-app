# Time Tracking App

A comprehensive time tracking application built with React, TypeScript, and Tailwind CSS. Features role-based authentication, project management, and detailed reporting capabilities.

## Features

### Authentication
- **Role-based Login**: Admin and User roles with different permissions
- **Registration**: Create new accounts with role selection
- **JWT Token Management**: Secure authentication with automatic token refresh
- **Protected Routes**: Route protection based on user roles

### User Management (Admin Only)
- View all users with filtering and search
- Create new user accounts
- Role management (Admin/User)
- User statistics and activity tracking

### Project Management
- **Admin Features**:
  - Create and edit projects
  - Assign users to projects
  - Set project deadlines and status
  - View all projects with filtering
- **User Features**:
  - View assigned projects
  - Track project progress

### Time Tracking
- Log time entries with descriptions
- Associate time with specific projects
- Edit and manage time entries
- Filter entries by date ranges
- Real-time time tracking statistics

### Reports & Analytics (Admin Only)
- Interactive charts and visualizations
- Filter reports by user, project, and date range
- Export reports to PDF
- Detailed time entry breakdowns
- Project and user performance metrics

### Dashboard
- **Admin Dashboard**:
  - System-wide statistics
  - Recent activity across all users
  - Project overview and status
- **User Dashboard**:
  - Personal time tracking statistics
  - Recent time entries
  - Assigned projects overview

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Export**: jsPDF
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API server (see Backend Setup section)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd time-tracking-app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
VITE_API_DEBUG=true
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Backend API Integration

This frontend is designed to work with a REST API backend. The API should provide the following endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### User Management Endpoints
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Project Management Endpoints
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/user/:userId` - Get projects for user
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `POST /api/projects/:id/assign` - Assign users to project (Admin only)

### Time Entry Endpoints
- `GET /api/time-entries` - Get all time entries
- `GET /api/time-entries/:id` - Get time entry by ID
- `GET /api/time-entries/user/:userId` - Get time entries for user
- `GET /api/time-entries/project/:projectId` - Get time entries for project
- `POST /api/time-entries` - Create time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry
- `GET /api/time-entries/reports` - Get filtered time entries for reports
- `GET /api/time-entries/statistics` - Get time tracking statistics

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get system statistics (Admin only)
- `GET /api/dashboard/user-stats/:userId` - Get user statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## API Response Format

All API endpoints should return responses in the following format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

For errors:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Authentication

The application uses JWT tokens for authentication. Tokens should be included in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Roles

### Admin Role
- Full access to all features
- User management capabilities
- Project creation and assignment
- System-wide reports and analytics
- Dashboard with global statistics

### User Role
- Time tracking for assigned projects
- Personal dashboard and statistics
- View assigned projects
- Limited to own data

## Demo Accounts

For testing purposes, you can use these demo accounts:

**Admin Account:**
- Email: admin@example.com
- Password: password

**User Account:**
- Email: user@example.com
- Password: password

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The built files will be in the `dist` directory.

## Development

### Code Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.tsx           # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.