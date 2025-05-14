import React from 'react';
import Sidebar from './components/Sidebar';
import UploadPage from './components/UploadPage';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <UploadPage />
      </main>
    </div>
  );
}

export default App;
