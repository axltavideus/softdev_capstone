import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadPage from './components/UploadPage';
import ProjectPage from './components/ProjectPage';
import KeluarPage from './components/KeluarPage';
import MasterDataMasukPage from './components/MasterDataMasukPage';
import MasterData from './components/master_data';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/keluar" element={<KeluarPage />} />
            <Route path="/masuk" element={<MasterDataMasukPage />} />
            <Route path="/master_data" element={<MasterData />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
