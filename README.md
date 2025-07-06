# 🛣️ RoadSense - Alternate Route Finder

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-blue.svg)](https://reactnative.dev)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black.svg)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.0-green.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Smart navigation that adapts to real-time road conditions and obstacles**

RoadSense is a comprehensive navigation platform that provides intelligent route finding with real-time obstacle detection and avoidance. The system uses advanced pathfinding algorithms to help users navigate around roadblocks, construction zones, and other obstacles in Kathmandu and Lalitpur, Nepal.

## 📋 Table of Contents

- [📘 Project Overview](#-project-overview)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Configuration](#️-configuration)
- [🧱 Project Structure](#-project-structure)
- [📚 Usage & Features](#-usage--features)
- [🧪 Testing](#-testing)
- [🛠️ Contributing](#️-contributing)
- [📄 License](#-license)
- [📬 Contact & Authors](#-contact--authors)
- [🧠 FAQs & Troubleshooting](#-faqs--troubleshooting)

---

## 📘 Project Overview

### What is RoadSense?

RoadSense is a multi-platform navigation application that combines real-time obstacle reporting with bidirectional A\* pathfinding algorithm. The system allows users to report road obstacles (like construction, accidents, or roadblocks) and automatically calculates alternative routes to avoid these obstacles.

### Purpose & Problem Solved

- **Real-time Navigation**: Provides up-to-date route information considering current road conditions
- **Community-Driven**: Users can report and verify obstacles, creating a collaborative navigation network
- **Smart Avoidance**: Uses configurable obstacle radius settings to find optimal alternative routes
- **Multi-Platform**: Available on mobile (Android) and web platforms

### Tech Stack

**Backend:**

- **Python 3.8+** with Flask framework
- **PostgreSQL** via Supabase for data persistence
- **OSMnx** for road network processing and graph operations
- **NetworkX** for pathfinding algorithms (Bidirectional A\*)
- **Cloudinary** for image storage and management

**Mobile App:**

- **React Native** with Expo framework
- **TypeScript** for type safety
- **React Navigation** for routing
- **Expo Location** for GPS functionality
- **React Native Paper** for UI components

**Web Platform:**

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations

**Infrastructure:**

- **Supabase** for authentication and database
- **Render** for server hosting
- **Vercel** for web hosting
- **Cloudinary** for media storage

### Current Status

🟢 **MVP Complete** - The application is fully functional with core features implemented and deployed.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **Python** (3.8 or higher)
- **Git** (for version control)
- **Expo CLI** (for mobile development)
- **PostgreSQL** (or Supabase account)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dangol-anish/RS-alternate-route-finder.git
   cd RS-alternate-route-finder
   ```

2. **Set up the backend server**

   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the mobile app**

   ```bash
   cd ../client/mobile
   npm install
   ```

4. **Set up the web platform**
   ```bash
   cd ../web
   npm install
   ```

### Running the Application

#### Backend Server

```bash
cd server
python app.py
```

The server will start on `http://localhost:5000`

#### Mobile App

```bash
cd client/mobile
npm start
```

This will open the Expo development server. You can then:

- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your device

#### Web Platform

```bash
cd client/web
npm run dev
```

The web app will be available at `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

Create the following environment files for each component:

#### Backend (server/.env)

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Mobile App (client/mobile/.env)

```env
# Server Configuration
EXPO_PUBLIC_IP_ADDRESS=http://localhost:5000

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Web Platform (client/web/.env.local)

```env
# Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Setting Up External Services

1. **Supabase Setup**

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `server/db.sql`
   - Copy your project URL and anon key to environment variables

2. **Cloudinary Setup**

   - Create an account at [cloudinary.com](https://cloudinary.com)
   - Get your cloud name, API key, and secret key
   - Add them to your environment variables

3. **Road Network Data**
   - The project includes preprocessed graph data for Kathmandu/Lalitpur
   - For other regions, you'll need to generate new graph data using OSMnx

---

## 🧱 Project Structure

```
RS-alternate-route-finder/
├── 📁 server/                    # Backend Flask application
│   ├── 📄 app.py                # Main Flask application
│   ├── 📄 routes.py             # API endpoints and business logic
│   ├── 📄 pathfinding.py        # Pathfinding algorithms
│   ├── 📄 spatial_index.py      # Spatial indexing for performance
│   ├── 📄 config.py             # Configuration settings
│   ├── 📄 utils.py              # Utility functions
│   ├── 📄 cache_utils.py        # Caching utilities
│   ├── 📄 requirements.txt      # Python dependencies
│   ├── 📄 db.sql                # Database schema
│   ├── 📁 tests/                # Test suite
│   ├── 📁 docs/                 # Documentation
│   └── 📁 cache/                # Cached data files
│
├── 📁 client/
│   ├── 📁 mobile/               # React Native mobile app
│   │   ├── 📁 app/              # Main application screens
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   ├── 📁 lib/              # Library configurations
│   │   ├── 📁 types/            # TypeScript type definitions
│   │   ├── 📁 assets/           # Images, fonts, and static files
│   │   ├── 📄 app.json          # Expo configuration
│   │   └── 📄 package.json      # Mobile app dependencies
│   │
│   └── 📁 web/                  # Next.js web platform
│       ├── 📁 app/              # Next.js app router pages
│       ├── 📁 components/       # React components
│       ├── 📁 lib/              # Utility libraries
│       ├── 📁 public/           # Static assets
│       └── 📄 package.json      # Web app dependencies
│
└── 📄 README.md                 # This file
```

### Key Files Explained

- **`server/routes.py`**: Contains all API endpoints for obstacle management, pathfinding, and user authentication
- **`server/pathfinding.py`**: Implements the bidirectional A\* algorithm for efficient route finding
- **`server/spatial_index.py`**: Provides spatial indexing for fast obstacle queries
- **`client/mobile/app/`**: Contains the main mobile app screens and navigation
- **`client/web/app/`**: Contains the web platform pages and components

---

## 📚 Usage & Features

### Core Features

#### 🗺️ Intelligent Pathfinding

- **Bidirectional A\* Algorithm**: Efficient route finding with obstacle avoidance
- **Configurable Obstacle Radius**: Adjustable avoidance distances (50m to 500m)
- **Real-time Updates**: Routes update automatically when new obstacles are reported

#### 📍 Obstacle Reporting

- **Photo Upload**: Users can upload images of obstacles
- **Location Tagging**: Automatic GPS location detection
- **Category Classification**: Different obstacle types (construction, accident, etc.)
- **Verification System**: Community-driven obstacle verification

#### 🔐 User Management

- **Authentication**: Secure signup/signin with Supabase
- **Profile Management**: User profiles with reporting history
- **Admin Panel**: Moderator tools for obstacle management

#### 📱 Multi-Platform Support

- **Mobile App**: Native Android applications
- **Web Platform**: Responsive web interface for downloading the APK

### How to Use

#### For End Users

1. **Install the Mobile App**

   - Download from app stores (when available)
   - Or build from source using Expo

2. **Report an Obstacle**

   - Open the app and navigate to the map
   - Tap the "+" button to report a new obstacle
   - Take a photo and add details
   - Submit the report

3. **Find Alternative Routes**
   - Set your destination on the map
   - The app will automatically calculate routes avoiding known obstacles
   - Choose from multiple route options

#### For Developers

**API Endpoints:**

```bash
# Pathfinding
POST /shortest_path
{
  "source": 12345,
  "destination": 67890,
  "obstacle_radius": "standard"
}

# Obstacle Management
POST /save_obstacles
GET /get_obstacles
POST /obstacle/verify

# User Authentication
POST /signup
POST /signin
POST /signout
```

**Mobile App Development:**

````bash
# Start development server
cd client/mobile
npm start

# Build for Android
npm run android

---

## 🧪 Testing

### Running Tests

#### Backend Tests

```bash
cd server
python run_tests.py
````

This will run:

- Unit tests for obstacle cache optimization
- Performance benchmarks
- Thread safety validation

#### Mobile App Tests

```bash
cd client/mobile
npm test
```

#### Web Platform Tests

```bash
cd client/web
npm test
```

### Test Coverage

- **Backend**: Comprehensive testing of pathfinding algorithms, obstacle management, and API endpoints
- **Mobile**: Component testing with React Native Testing Library
- **Web**: Unit tests for React components and utilities

### Adding New Tests

#### Backend Tests

Create test files in `server/tests/` following the pattern `test_*.py`:

```python
import unittest
from pathfinding import bidirectional_astar

class TestPathfinding(unittest.TestCase):
    def test_shortest_path(self):
        # Your test implementation
        pass
```

#### Mobile Tests

Create test files in `client/mobile/__tests__/`:

```typescript
import { render, screen } from "@testing-library/react-native";
import { ComponentName } from "../ComponentName";

test("renders correctly", () => {
  render(<ComponentName />);
  // Your test assertions
});
```

---

## 🛠️ Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**

   ```bash
   # Backend tests
   cd server && python run_tests.py

   # Mobile tests
   cd client/mobile && npm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new obstacle reporting feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Coding Standards

#### Backend (Python)

- Follow PEP 8 style guidelines
- Use type hints for function parameters
- Add docstrings to all functions and classes
- Maximum line length: 88 characters (Black formatter)

#### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling

#### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

### Pull Request Guidelines

1. **Clear Description**: Explain what the PR does and why
2. **Tests**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Screenshots**: Include screenshots for UI changes
5. **Review**: Ensure all CI checks pass

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 RoadSense Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📬 Contact & Authors

### Maintainers

- **Anish Dangol** - _Lead Developer_
  - GitHub: [@anishdangol](https://github.com/dangol-anish)
    - Email: [dangol.anish001@gmail.com]

### Contributors

We appreciate all contributors who have helped make RoadSense better! See our [Contributors](https://github.com/dangol-anish/RS-alternate-route-finder/graphs/contributors) page for a complete list.

### Support

- **Issues**: [GitHub Issues](https://github.com/dangol-anish/RS-alternate-route-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dangol-anish/RS-alternate-route-finder/discussions)
- **Email**: [dangol.anish001@gmail.com](mailto:dangol.anish001@gmail.com)

---

## 🧠 FAQs & Troubleshooting

### Frequently Asked Questions

#### Q: How accurate is the pathfinding algorithm?

A: The bidirectional A\* algorithm provides optimal routes with configurable obstacle avoidance. The system uses real road network data from OpenStreetMap for high accuracy.

#### Q: Can I use RoadSense in other cities?

A: Currently, the system is optimized for Kathmandu and Lalitpur, Nepal. To add support for other cities, you'll need to generate new road network graphs using OSMnx.

#### Q: How do I report a false obstacle?

A: Use the verification system in the app to mark obstacles as resolved or incorrect. Community verification helps maintain data quality.

#### Q: Is my location data private?

A: Yes, we only collect location data when you actively report obstacles or request routes. We don't track your movements.

### Common Issues & Solutions

#### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'osmnx'`

```bash
# Solution: Install missing dependencies
cd server
pip install -r requirements.txt
```

**Problem**: `ConnectionError: Failed to connect to Supabase`

```bash
# Solution: Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_KEY
# Ensure these are set correctly in your .env file
```

**Problem**: `FileNotFoundError: kathmandu_lalitpur_graph.gpickle`

```bash
# Solution: The graph file should be included in the repository
# If missing, contact the maintainers or regenerate using preprocess_graph.py
```

#### Mobile App Issues

**Problem**: Expo development server not starting

```bash
# Solution: Clear cache and restart
cd client/mobile
npx expo start --clear
```

**Problem**: Android build fails

```bash
# Solution: Clean and rebuild
cd client/mobile/android
./gradlew clean
cd ..
npx expo run:android
```

**Problem**: iOS build fails

```bash
# Solution: Clean and reinstall pods
cd client/mobile/ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

#### Web Platform Issues

**Problem**: Next.js development server not starting

```bash
# Solution: Clear cache and reinstall dependencies
cd client/web
rm -rf .next node_modules
npm install
npm run dev
```

**Problem**: Environment variables not loading

```bash
# Solution: Ensure .env.local file exists and restart server
# Check that variables start with NEXT_PUBLIC_ for client-side access
```

### Performance Optimization

#### Backend Performance

- The system uses spatial indexing for fast obstacle queries
- Obstacle cache reduces database load by 10x
- Pathfinding algorithms are optimized for real-time use

#### Mobile App Performance

- Images are compressed before upload
- Route calculations are cached locally
- Offline mode available for basic functionality

#### Web Platform Performance

- Static generation for landing pages
- Client-side caching for API responses
- Optimized bundle sizes with Next.js

### Debugging Tips

1. **Check Logs**: Monitor server logs for detailed error information
2. **Network Tab**: Use browser dev tools to inspect API requests
3. **React Native Debugger**: Use Flipper or React Native Debugger for mobile debugging
4. **Environment Variables**: Verify all required environment variables are set
5. **Database Connection**: Test Supabase connection separately

---

## 🙏 Acknowledgments

- **OpenStreetMap** for providing the road network data
- **Supabase** for the backend-as-a-service platform
- **Expo** for the React Native development framework
- **Vercel** for the Next.js hosting platform
- **Cloudinary** for image storage and optimization
- **All contributors** who have helped improve RoadSense

---

<div align="center">

**Made with ❤️ for better navigation**

[![GitHub stars](https://img.shields.io/github/stars/dangol-anish/RS-alternate-route-finder?style=social)](https://github.com/dangol-anish/RS-alternate-route-finder/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dangol-anish/RS-alternate-route-finder?style=social)](https://github.com/dangol-anish/RS-alternate-route-finder/network)
[![GitHub issues](https://img.shields.io/github/issues/dangol-anish/RS-alternate-route-finder)](https://github.com/dangol-anish/RS-alternate-route-finder/issues)

</div>
