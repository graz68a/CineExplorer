# CineExplorer

CineExplorer is an advanced web application for discovering movies, TV series, and actors, relying on the **TMDB (The Movie Database)** API.
It offers a modern, fluid, and responsive user interface, designed to provide a premium user experience, featuring **Gomoot** branding.

## ✨ Main Features

### 🔍 Discovery & Advanced Search

* **Universal Search**: Search for movies, TV series, and people from a single bar.
* **Trending Section**: Discover top titles for the day or week with an interactive carousel.
* **Smart Filters**: Filter by **Year**, **Rating**, **Genre**, **Vote Count**, **Runtime**, and **Production Country**.
* **Dynamic Sorting**: Sort by popularity, rating, release date, and more.
* **Genre Exclusion**: Shift+Click on a genre to exclude it from results.

### 🎬 Content Details

* **Complete Info**: Plot, cast, crew, technical details, and original titles.
* **Streaming Availability**: Discover where to watch a movie/series in your country.
* **Trailers**: Assessment trailers without leaving the page.
* **Recommendations**: "You might also like" section for similar content.

### 👤 Actor Profiles & Filmography

* **Biographies**: Detailed information about actors.
* **Interactive Filmography**: Browse all the works of an actor, sorted by **Rating**.
* **Provider Filtering**: Filter an actor's filmography to see only what's available on your streaming services.

### ⚙️ Settings & Internationalization

* **Regional Preferences**: Change the application language and streaming region (Italy, USA, UK, etc.).
* **API Configuration**: Input your TMDB API keys directly in the Settings page. Keys are stored safely in `localStorage`.
* **Local Network**: View your local LAN IP to easily access the app from your phone or tablet.

## 🛠 Technology Stack

* **Frontend**: React (Vite)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, PostCSS
* **Icons**: Lucide React, Simple Icons Branding
* **Routing**: React Router
* **HTTP Client**: Axios
* **Animations**: Framer Motion

## 🚀 Installation

1. **Clone the repository**:

    ```bash
    git clone [repo-url]
    cd tmdb
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start the server**:

    ```bash
    npm run dev
    ```

4. **Configuration**:
    * Open the app in your browser settings URL.
    * Enter your **TMDB API Key (v3)** and **Bearer Token (v4)**.
    * Select your preferred Region/Language.
    * Save.

## 🌍 Deployment (cPanel / Static Hosting)

This application is compatible with any static hosting service or cPanel.

1. **Build the project**:

    ```bash
    npm run build
    ```

    This creates a `dist` folder with the optimized production files.

2. **Upload to cPanel**:
    * Go to your cPanel **File Manager**.
    * Navigate to `public_html` (or your subdomain folder).
    * Upload **the contents** of the `dist` folder.
    * **Important**: Ensure the `.htaccess` file (included in `dist`) is also uploaded to handle routing correctly.

## 📱 Mobile Support

The application is fully responsive and optimized for use on smartphones and tablets, with mobile-specific navigation menus, touch-friendly controls, and social media connectivity (Bluesky, Mastodon, Threads, etc.).
