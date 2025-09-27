# 🎓 Placement Navigator - AI-Powered University Placement Management System

An intelligent placement management system that leverages AI to streamline university placement processes, providing personalized job matching, automated resume generation, and comprehensive analytics for students and administrators.

## 🌟 Features

### 🤖 AI-Powered Capabilities
- **Intelligent Job Matching**: AI algorithms match students with relevant job opportunities based on skills, preferences, and academic background
- **Automated Resume Generation**: Generate tailored resumes for specific job applications using AI
- **Skill Gap Analysis**: Identify missing skills and provide personalized learning recommendations
- **Progress Tracking**: Monitor student placement journey with AI-driven insights

### 📊 Analytics & Insights
- **Student Dashboard**: Comprehensive analytics showing application progress, success rates, and recommendations
- **Real-time Recommendations**: Dynamic job suggestions based on student profile and market trends
- **Performance Metrics**: Track placement statistics, application success rates, and skill development

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Different access levels for students, recruiters, and administrators
- **Data Privacy**: Secure handling of sensitive student and company data

### 📱 Modern User Experience
- **Responsive Design**: Mobile-friendly interface that works across all devices
- **Real-time Updates**: Live notifications and updates on application status
- **Intuitive UI**: Clean, modern interface built with React and Next.js

## 🏗️ Architecture

```
Placement-Navigator/
├── backend/           # FastAPI backend server
├── frontend/          # Next.js React frontend
├── mcp_server/        # MCP (Model Context Protocol) AI agents
├── shared/            # Shared models and utilities
└── docs/              # Documentation
```

### Backend (FastAPI)
- **Authentication System**: JWT-based auth with role management
- **Job Management**: CRUD operations for job postings and applications
- **Analytics API**: Endpoints for student and placement analytics
- **MCP Integration**: Communication with AI agents for intelligent features

### Frontend (Next.js + React)
- **Student Dashboard**: Analytics and application management
- **Job Application Interface**: AI-powered application process
- **Authentication UI**: Login, registration, and profile management
- **Responsive Components**: Mobile-first design approach

### MCP Server (AI Agents)
- **Matching Agent**: Intelligent job-student matching algorithms
- **Resume Agent**: Automated resume generation and optimization
- **Tracker Agent**: Progress monitoring and analytics generation

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL** (or SQLite for development)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/sudo2182/Placement-Navigator.git
cd Placement-Navigator
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API configurations

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn main:app --reload --port 8000
```

### 3. MCP Server Setup
```bash
cd mcp_server

# Create virtual environment
python -m venv mcp_venv
source mcp_venv/bin/activate  # On Windows: mcp_venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the MCP server
python placement_server.py
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API endpoints

# Start the development server
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MCP Server**: http://localhost:8001

## 📋 Installation Requirements

### Python Dependencies (Backend & MCP Server)
```bash
# Install all Python requirements
pip install -r requirements.txt
```

### Node.js Dependencies (Frontend)
```bash
# Install all Node.js requirements
npm install
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/placement_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MCP_SERVER_URL=http://localhost:8001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MCP_URL=http://localhost:8001
```

#### MCP Server (.env)
```env
PORT=8001
LOG_LEVEL=INFO
AI_MODEL_ENDPOINT=your-ai-model-endpoint
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /jobs/` - List available jobs
- `POST /jobs/apply` - Apply to a job
- `GET /analytics/student/{id}` - Student analytics
- `POST /ai/generate-resume` - AI resume generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write tests for new features
- Update documentation for API changes

## 📁 Project Structure

```
Placement-Navigator/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── routers/              # API route handlers
│   │   ├── auth.py           # Authentication routes
│   │   ├── jobs.py           # Job management routes
│   │   └── analytics.py      # Analytics routes
│   ├── services/             # Business logic services
│   ├── main.py               # FastAPI application
│   ├── schemas.py            # Pydantic models
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utility libraries
│   │   └── store/            # State management
│   ├── package.json          # Node.js dependencies
│   └── next.config.ts        # Next.js configuration
├── mcp_server/
│   ├── agents/               # AI agent implementations
│   │   ├── matching_agent.py # Job matching AI
│   │   ├── resume_agent.py   # Resume generation AI
│   │   └── tracker_agent.py  # Progress tracking AI
│   ├── tools/                # MCP tools and utilities
│   └── placement_server.py   # MCP server main
├── shared/
│   ├── models/               # Shared data models
│   └── utils/                # Common utilities
└── docs/                     # Project documentation
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Server Won't Start
- Check if port 8000 is available
- Verify database connection in `.env`
- Ensure all dependencies are installed

#### Frontend Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify environment variables in `.env.local`

#### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Run migrations: `alembic upgrade head`

#### MCP Server Connection Failed
- Verify MCP server is running on correct port
- Check firewall settings
- Ensure AI model endpoints are accessible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: SIH 2024 Team
- **Project Lead**: [Your Name]
- **Backend Developer**: [Backend Dev Name]
- **Frontend Developer**: [Frontend Dev Name]
- **AI/ML Engineer**: [AI Dev Name]

## 🙏 Acknowledgments

- Built for Smart India Hackathon 2024
- Powered by FastAPI, Next.js, and AI technologies
- Special thanks to the open-source community

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation at `/docs`

---

**Made with ❤️ for Smart India Hackathon 2024**