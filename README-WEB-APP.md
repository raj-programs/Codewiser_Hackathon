# Smart Developer Roadmap Generator - Web Application

A complete web application that extends the deterministic roadmap generator with a React frontend and Express backend.

## 🏗️ Architecture

- **Backend**: Node.js + Express (Port 5000)
- **Frontend**: React + Vite (Port 5173)
- **Logic**: Uses existing deterministic modules without modification

## 📁 Project Structure

```
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── server.ts
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── styles.css
├── src/ (existing logic - NOT modified)
│   ├── types/
│   ├── skill-graph/
│   ├── gap-analysis/
│   ├── rules/
│   ├── algorithms/
│   ├── explanation/
│   ├── RoadmapGenerator.ts
│   └── index.ts
└── README-WEB-APP.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start the frontend development server:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

3. **Open your browser and navigate to:**
```
http://localhost:5173
```

## 🔧 API Endpoints

### POST /generate-roadmap
Generates a personalized learning roadmap.

**Request Body:**
```json
{
  "skills": "html-basics, css-basics",
  "goal": "fullstack",
  "timePerWeek": "10",
  "currentSkills": []
}
```

**Response:**
```json
{
  "roadmap": {
    "id": "path-beginner-full-stack-developer-react-basics",
    "title": "Full Stack Development Path",
    "description": "...",
    "skills": [...],
    "totalEstimatedHours": 120,
    "milestones": [...],
    "prerequisitesMet": false
  },
  "milestones": [...],
  "skillGaps": [...],
  "summary": "...",
  "explanation": [...]
}
```

### GET /health
Health check endpoint.

## 🎯 Features

### Frontend
- **Input Form**: Skills, goal selection, time commitment
- **Results Display**: Clean card-based layout showing:
  - Learning steps with difficulty levels
  - Milestones with progress tracking
  - Skill gaps with priorities
  - Summary and explanations
- **Responsive Design**: Works on desktop and mobile
- **Real-time Generation**: Instant roadmap creation

### Backend
- **Express Server**: RESTful API with CORS support
- **Deterministic Logic**: Uses existing RoadmapGenerator
- **Skill Database**: 11 pre-configured skills with dependencies
- **Error Handling**: Comprehensive error responses

## 🎨 UI Components

### Input Form
- Skills input (comma-separated)
- Goal dropdown (frontend/backend/fullstack)
- Time per week selector
- Submit button with loading state

### Results Sections
1. **Summary**: Overview with key metrics
2. **Learning Steps**: Ordered skill list with details
3. **Milestones**: Achievement checkpoints
4. **Skill Gaps**: Identified learning needs
5. **Explanation**: Why this roadmap was generated

## 🔗 Integration Details

### Backend Integration
- Imports `RoadmapGenerator` from `../src/RoadmapGenerator`
- Uses `GapAnalysisEngine` and `ExplanationEngine`
- Maintains all existing deterministic logic
- No AI/ML APIs used

### Frontend Integration
- React functional components with hooks
- Vite dev server with proxy configuration
- CSS Grid and Flexbox for responsive layout
- Fetch API for backend communication

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run watch  # Auto-restart on changes
```

### Frontend Development
```bash
cd frontend
npm run dev    # Hot reload enabled
```

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd ../backend
npm run build
npm start
```

## 📋 Available Skills

The backend includes 11 pre-configured skills:

**Beginner:**
- HTML Basics
- CSS Basics  
- JavaScript Basics

**Intermediate:**
- React Basics
- Node.js Basics
- Express.js Basics
- Database Basics
- MongoDB Basics

**Advanced:**
- Full-Stack Project
- Advanced React
- API Design Principles

Each skill includes:
- Prerequisites (DAG structure)
- Estimated hours
- Learning resources
- Difficulty levels
- Category tags

## 🎯 Example Usage

1. Enter current skills: `html-basics`
2. Select goal: `fullstack`
3. Set time commitment: `10 hours/week`
4. Click "Generate Roadmap"
5. View your personalized learning path

The system will:
- Analyze your current skill level
- Identify skill gaps
- Create a dependency-resolved learning order
- Provide milestones and explanations
- Suggest additional relevant skills

## 🔒 Security Notes

- CORS enabled for frontend-backend communication
- Input validation on backend
- Error handling prevents information leakage
- No external API calls or AI services

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ folder to your web server
```

## 📞 Support

This web application maintains the deterministic nature of the original roadmap generator while providing an accessible web interface. No AI/ML services are used - all recommendations are rule-based and reproducible.
