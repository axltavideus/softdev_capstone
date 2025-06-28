import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UploadPage.css';

function UploadPage({ isAdmin }) {
  const [file, setFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [frequentLowStockItems, setFrequentLowStockItems] = useState({ mostFrequent: null, almostOutOfStock: null });

  useEffect(() => {
    fetchProjects();
    fetchFrequentLowStockItems();
  }, []);

  const fetchFrequentLowStockItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/barangkeluar/frequent-low-stock');
      setFrequentLowStockItems(res.data);
    } catch (error) {
      console.error('Error fetching frequent low stock items:', error);
    }
  };

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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const sortedProjects = React.useMemo(() => {
    if (!sortConfig) return projects;
    const sorted = [...projects].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [projects, sortConfig]);

  return (
    <div className="upload-page">
      <div className="upload-top-section">
        {isAdmin && (
          <div className="upload-bom-section">
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
          </div>
        )}

        <div className="frequent-low-stock-card">
          <h3>Barang Paling Sering Keluar & Hampir Habis</h3>
          {!frequentLowStockItems.mostFrequent && !frequentLowStockItems.almostOutOfStock ? (
            <p>Tidak ada data barang yang hampir habis.</p>
          ) : (
            <>
              {frequentLowStockItems.mostFrequent && (
                <div>
                  <h4>Paling Sering Keluar</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Deskripsi</th>
                        <th>Stok</th>
                        <th>Jumlah Keluar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key={frequentLowStockItems.mostFrequent.id}>
                        <td>{frequentLowStockItems.mostFrequent.deskripsi}</td>
                        <td>{frequentLowStockItems.mostFrequent.stock}</td>
                        <td>{frequentLowStockItems.mostFrequent.totalKeluar}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {frequentLowStockItems.almostOutOfStock && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Hampir Habis</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Deskripsi</th>
                        <th>Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key={frequentLowStockItems.almostOutOfStock.id}>
                        <td>{frequentLowStockItems.almostOutOfStock.deskripsi}</td>
                        <td>{frequentLowStockItems.almostOutOfStock.stock}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <h2>Daftar Projek</h2>
      <table className="project-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>
              Nama Projek {sortConfig?.key === 'projectName' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('projectCode')} style={{ cursor: 'pointer' }}>
              Kode Projek {sortConfig?.key === 'projectCode' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('progress')} style={{ cursor: 'pointer' }}>
              Progress {sortConfig?.key === 'progress' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedProjects.map((project) => (
            <tr key={project.id}>
              <td>
                <Link to={`/project/${project.id}`}>{project.projectName}</Link>
              </td>
              <td>{project.projectCode}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <progress
                    value={project.progress}
                    max="1"
                    style={{ width: '150px', height: '15px', color: 'green' }}
                  />
                  <span>{Math.round(project.progress * 100)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UploadPage;
