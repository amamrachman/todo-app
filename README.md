A modern, full-stack todo list application built with cutting-edge technologies to demonstrate clean architecture, performance optimization, and best practices in web development.

Backend
- **Framework**: Go Fiber v3 (High-performance web framework)
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT (JSON Web Tokens) - *Ready for implementation*
- **API Style**: RESTful architecture
- **Security**: CORS, Rate Limiting, Environment variables

Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8 (Lightning fast development)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useReducer, Context)
- **HTTP Client**: Axios with request cancellation & caching
- **Icons**: Lucide React

## ✨ Key Features

### Core Functionality
- ✅ **CRUD Operations**: Create, Read, Update, and Delete todos
- ✅ **Real-time Updates**: Instant UI updates with optimistic updates
- ✅ **Smart Filtering**: Filter todos by All, Active, and Completed
- ✅ **Infinite Scroll**: Seamless pagination for large datasets
- ✅ **Responsive Design**: Mobile-friendly interface

### Advanced Features
- 🚀 **Request Cancellation**: Abort unnecessary API calls
- 💾 **API Caching**: Reduce redundant network requests
- 🔄 **Optimistic Updates**: Immediate UI feedback
- 🎯 **Type Safety**: Full TypeScript coverage
- 🧹 **Code Splitting**: Lazy loading for better performance

## 📊 Performance Optimizations

### Backend Optimizations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Selective field retrieval
- **Prepared Statements**: SQL injection prevention & performance
- **Rate Limiting**: Protection against abuse (100 requests/minute)
- **Gzip Compression**: Smaller payload sizes

### Frontend Optimizations
- **Virtual Scrolling**: Smooth rendering of thousands of items
- **Memoization**: Prevent unnecessary re-renders
- **Debounced Inputs**: Reduce state updates
- **Lazy Loading**: Split code by routes/components
- **Bundle Optimization**: Tree shaking and compression

## 🏗️ Architecture

Project Structure
todo-app/
├── backend/
│   ├── config/         # Database configuration
│   ├── handlers/       # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── main.go         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API services
│   │   ├── types/      # TypeScript types
│   │   └── App.tsx     # Main component
│   └── index.html      # Entry HTML
└── .gitignore          # Git ignore rules

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all todos (paginated) |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create new todo |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |

## 🔒 Security Features

- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Restricted API access
- **Input Validation**: Request body validation
- **SQL Injection Prevention**: GORM parameterized queries
- **Request Timeouts**: 10-second timeout limit

## 🚦 Getting Started

### Prerequisites
- Go 1.21+
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd todo-app
```

2. **Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
go mod download
go run main.go
```

3. **Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/health

## 🧪 Testing

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests
cd frontend
npm run test
```

## 📈 Future Enhancements

- [ ] User authentication with JWT
- [ ] Todo categories/labels
- [ ] Due dates and reminders
- [ ] Share todos with other users
- [ ] File attachments
- [ ] Real-time collaboration
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

