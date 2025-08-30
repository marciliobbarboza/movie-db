# Movie Database Project (TMDB API)

This is a Full Stack project that uses [The Movie Database (TMDB)](https://www.themoviedb.org/) API to populate a MongoDB database and display movie information in a modern, reactive UI built with React.

## 📜 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup and Installation](#-setup-and-installation)
- [Available Scripts](#-available-scripts)
- [API Endpoints](#-api-endpoints)

## 🌟 Overview

The project is divided into two main parts:

1.  **Back-End:** A RESTful API built with Node.js and Express.js, responsible for communicating with the MongoDB database (using Mongoose), managing movie data, and providing endpoints for the front end. It includes a feature to fetch data from the external TMDB API and populate the local database.
2.  **Front-End:** A Single-Page Application (SPA) developed with React and Vite, which consumes the back-end API to dynamically display movies, allow searches, and show details for each title.

## ✨ Features

-   **Movie Listing:** Displays movies stored in the database with pagination.
-   **Movie Search:** Allows users to search for movies by title.
-   **Detailed View:** Shows detailed information for a specific movie, such as its synopsis, release date, poster, etc.
-   **Database Populator:** A dedicated back-end route to feed the database with popular movies from the TMDB API.

## 🚀 Tech Stack

#### **Back-End**

-   **Node.js:** JavaScript runtime environment.
-   **Express.js:** Framework for building the API.
-   **MongoDB:** NoSQL database for data storage.
-   **Mongoose:** ODM for modeling and interacting with MongoDB.
-   **Axios:** HTTP client for making requests to the TMDB API.
-   **dotenv:** For managing environment variables.

#### **Front-End**

-   **React:** Library for building the user interface.
-   **Vite:** High-performance build tool for front-end development.
-   **Axios:** HTTP client for making requests to the back-end.

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/en/) (v18.x or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [MongoDB](https://www.mongodb.com/) instance (either local or a cluster on MongoDB Atlas)
-   An **API Key** from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api). It's free and easy to obtain.

## 🛠️ Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies** (this should install both back-end and front-end dependencies if configured in the root `package.json`):
    ```bash
    npm install
    ```
    *If the front end is in a separate folder (e.g., `/client`), you may need to install its dependencies separately:*
    ```bash
    cd client
    npm install
    cd ..
    ```

3.  **Create the environment variables file** in the project's root directory. Create a file named `.env` and add the following variables:
    ```env
    # Database Configuration
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/moviesDB?retryWrites=true&w=majority

    # TMDB API Key
    TMDB_API_KEY=your_api_key_here

    # API Port
    API_PORT=3000
    ```
    - Replace `<user>`, `<password>`, and the cluster info with your actual MongoDB connection string.
    - Insert the API key you obtained from TMDB.

## 🏃 Available Scripts

All commands should be run from the root of the project.

-   **To start the back-end server (API):**
    ```bash
    npm run dev
    ```
    The server will be running at `http://localhost:3000`.

-   **To start the front-end client:**
    ```bash
    npm run front
    ```
    The React application will be accessible at `http://localhost:5173`.

## 📡 API Endpoints

The back-end API exposes the following main endpoints:

| Method | Route              | Description                                        |
| :----- | :----------------- | :------------------------------------------------- |
| `GET`  | `/api/movies`      | Returns a list of all movies in the database.      |
| `GET`  | `/api/movies/:id`  | Returns the details of a specific movie by its ID. |
| `POST` | `/api/populate`    | **(Special)** Populates the database with data from the TMDB API. |

---