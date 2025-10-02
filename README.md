# Face Recognition App

A full-stack web application that detects and counts faces in images using AI-powered face detection. Built with React frontend, Node.js backend, and integrated with Clarifai's face detection API.

## 🚀 Features

- **User Authentication**: Secure registration and login system with password hashing
- **Face Detection**: Detect multiple faces in images using Clarifai's AI model
- **Visual Feedback**: Draw bounding boxes around detected faces
- **Entry Tracking**: Track the number of images processed per user
- **Real-time Updates**: Dynamic face count updates based on detection results
- **Responsive Design**: Clean, modern UI that works across devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks (useState, useRef, useEffect)
- **Vite** for fast development and building
- **CSS** with Tachyons for styling
- **Particles.js** for animated background

### Backend
- **Node.js** with Express
- **PostgreSQL** database with Knex.js query builder
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### APIs & Services
- **Clarifai API** for face detection
- **Environment variables** for secure API key management

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **PostgreSQL** database
- **Clarifai API account** and API key

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/VanessaBusekrus/faceRecognition.git
cd faceRecognition
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_PAT=your_clarifai_api_key
VITE_API_USER_ID=your_clarifai_user_id  
VITE_API_APP_ID=your_clarifai_app_id
```

### 4. Database Setup
Set up your PostgreSQL database with the following tables:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  entries BIGINT DEFAULT 0,
  joined TIMESTAMP DEFAULT now(),
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  temp_two_factor_secret VARCHAR(255)
);

-- Login table
CREATE TABLE login (
  id SERIAL PRIMARY KEY,
  hash VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);
```

### 5. Backend Setup
Make sure your backend server is configured to:
- Connect to your PostgreSQL database
- Handle CORS for frontend requests
- Use bcrypt for password hashing
- Serve on `http://localhost:3000`

### 6. Run the Application
```bash
# Development mode
npm run dev

# Build for production
npm run build
```

## 🎯 Usage

1. **Register** a new account or **sign in** with existing credentials
2. **Enter an image URL** in the input field
3. **Click "Detect"** to analyze the image
4. **View results**: See bounding boxes around detected faces and face count
5. **Track progress**: Your entry count increases based on faces detected

## 🏗️ Project Structure

```
face_recognition/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Navigation/    # Navigation bar
│   │   ├── Logo/         # App logo
│   │   ├── ImageLinkForm/ # URL input form
│   │   ├── Rank/         # User rank display
│   │   ├── FaceRecognition/ # Image and face boxes
│   │   ├── SignIn/       # Login form
│   │   └── Register/     # Registration form
│   ├── App.jsx           # Main application component
│   ├── App.css          # Application styles
│   └── main.jsx         # React entry point
├── .env                  # Environment variables
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🔧 Key Features Implementation

### Multiple Face Detection
- Processes Clarifai API response to extract face regions
- Calculates bounding box coordinates for each detected face
- Renders multiple boxes dynamically on the image

### Security Features
- Generic error messages to prevent user enumeration
- Password hashing with bcrypt and salt rounds
- Input validation and sanitization
- Secure environment variable handling

### State Management
- React Hooks for component state
- useRef for DOM element references and API data caching
- Proper state cleanup and error handling

## 🚦 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /signin` - User login
- `PUT /image` - Update user entry count

### Response Format
```json
{
  "id": 1,
  "name": "John Doe", 
  "email": "john@example.com",
  "entries": 5,
  "joined": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Common Issues
- **"Connection Refused"**: Make sure backend server is running on port 3000
- **"No faces detected"**: Verify image URL is accessible and contains faces
- **"Registration failed"**: Check database connection and user doesn't already exist

### Development Tips
- Use browser DevTools Console to debug API responses
- Check Network tab for failed requests
- Verify environment variables are loaded correctly
