import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPage from './components/UploadPage';
import ProjectPage from './components/ProjectPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
