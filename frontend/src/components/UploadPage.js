import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UploadPage.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file to upload.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/projects/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message);
      setFile(null);
      fetchProjects(); // Refresh project list after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload File Bill Of Material</h2>
      <label htmlFor="fileInput">Nama File</label>
      <input
        id="fileInput"
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>

      <h2>Daftar Projek</h2>
      <table className="project-table">
        <thead>
          <tr>
            <th>Nama Projek</th>
            <th>Kode Projek</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <Link to={`/project/${project.id}`}>{project.projectName}</Link>
              </td>
              <td>{project.projectCode}</td>
              <td>
                <progress
                  value={project.progress}
                  max="1"
                  style={{ width: '150px', height: '15px' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UploadPage;
