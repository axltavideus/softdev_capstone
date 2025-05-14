# Storage Management Web App

This project is a scalable web application for managing storage and Bill of Materials (BOM) checklists. It allows users to upload BOM files, store data in a database, and track progress by crossing off checklist items.

## Project Structure

- **backend/**: Node.js + Express backend with Sequelize ORM and MySQL database.
- **frontend/**: React frontend with components for UI and interaction.

## Features

- Upload BOM files (Excel/CSV) to populate the database.
- View and manage projects and BOM items.
- Cross off checklist items as work progresses.
- Scalable architecture for future enhancements like OCR scanning.

## Prerequisites

- Node.js and npm installed.
- MySQL or MariaDB server (Laragon recommended).
- Git for version control.

## Setup Instructions

### Backend

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend folder with the following content:
   ```
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   PORT=5000
   ```

4. Create the MySQL database manually using your preferred tool (e.g., phpMyAdmin, MySQL CLI).

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

## Usage

- Access the frontend at `http://localhost:3000`.
- Use the sidebar to navigate and upload BOM files.
- Manage projects and checklist items.

## Collaboration

- Use Git for version control.
- Branch and merge features as needed.
- Follow consistent coding standards.

## Future Enhancements

- Implement file upload backend and CSV parsing.
- Add OCR scanning for paper form recognition.
- Improve UI/UX and add authentication.

## Contact

For questions or contributions, please contact the project maintainer.
