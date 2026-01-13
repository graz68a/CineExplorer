# 🎬 CineExplorer

A beautiful, modern Android application for discovering movies and TV shows, powered by TMDB API. Built with React and compiled natively using Capacitor.

## ✨ Features

- **Trending Content**: Discover what's hot today or this week with a sleek carousel interface.
- **Advanced Search & Filtering**:
  - Filter by Genre, Release Year, Vote Average.
  - **Dynamic Streaming Providers**: Select your country to see where movies are streaming (Netflix, Prime, Disney+, etc.).
  - **Production Country**: Filter by popular countries with smart search.
- **Rich Details**: Watch official Youtube trailers, view cast members, and browse similar movie recommendations.
- **Modern UI/UX**:
  - Dark mode aesthetic with glassmorphism effects.
  - Smooth animations using Framer Motion.
  - Responsive layout optimized for mobile.

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Android Studio**: Required if you want to build the Android APK locally.
- **TMDB API Key**: You need to register for a free API key at [themoviedb.org](https://www.themoviedb.org/settings/api).

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/graz68a/CineExplorer.git
   cd CineExplorer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the root directory (copy from `.env.example`) and add your TMDB API Read Access Token (v4 auth):

   ```env
   VITE_API_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_ACCESS_TOKEN=your_actual_access_token_here
   ```

4. **Run Locally (Web Mode)**

   ```bash
   npm run dev
   ```

### 📱 Android Build

To build the Android application:

1. **Build the web project**

   ```bash
   npm run build
   ```

2. **Sync Capacitor**

   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio** (Optional, for running on emulator)

   ```bash
   npx cap open android
   ```

4. **Build APK from Command Line** (Windows)

   ```powershell
   cd android
   ./gradlew assembleDebug
   ```

   The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

## ⚠️ Disclaimer

This product uses the TMDB API but is not endorsed or certified by TMDB.
All movie data and images are provided by The Movie Database.

---

Made with ❤️ by Graziano
