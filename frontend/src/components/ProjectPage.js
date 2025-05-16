import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ProjectPage.css';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const [keluarValues, setKeluarValues] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  const handleTotalQtyChange = (itemId, value) => {
    setProject(prevProject => {
      const updatedBomItems = prevProject.bomItems.map(item => {
        if (item.id === itemId) {
          return { ...item, totalQty: value };
        }
        return item;
      });
      return { ...prevProject, bomItems: updatedBomItems };
    });
  };

  const handleInputChange = (itemId, value) => {
    setInputValues(prev => ({ ...prev, [itemId]: value }));
    setErrorMessages(prev => ({ ...prev, [itemId]: '' }));
  };

  const handleSubmitAll = async () => {
    let hasError = false;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const projectName = project.projectName || '';
    const deskripsi = ''; // Can be customized or taken from item if needed
    const keterangan = ''; // Optional

    for (const item of project.bomItems) {
      const itemId = item.id;
      const totalQty = item.totalQty;
      const value = inputValues[itemId];
      if (!value) continue; // Skip if no input

      const keluarValue = parseFloat(value);
      if (isNaN(keluarValue) || keluarValue < 0) {
        setErrorMessages(prev => ({ ...prev, [itemId]: 'Invalid input' }));
        hasError = true;
        continue;
      }

      const currentKeluar = keluarValues[itemId] || 0;
      const newTotalKeluar = currentKeluar + keluarValue;

      if (newTotalKeluar > totalQty) {
        setErrorMessages(prev => ({ ...prev, [itemId]: 'Total keluar exceeds totalQty' }));
        hasError = true;
        continue;
      }

      try {
        await axios.post(`http://localhost:5000/api/projects/${project.id}/bomitems/${itemId}/keluar`, {
          tanggal: today,
          deskripsi,
          keluar: keluarValue,
          keterangan,
          namaProjek: projectName,
        });

        setKeluarValues(prev => ({ ...prev, [itemId]: newTotalKeluar }));
        setInputValues(prev => ({ ...prev, [itemId]: '' }));
        setErrorMessages(prev => ({ ...prev, [itemId]: '' }));
      } catch (error) {
        setErrorMessages(prev => ({ ...prev, [itemId]: 'Failed to save keluar' }));
        hasError = true;
      }
    }

    if (!hasError) {
      alert('All inputs saved successfully.');
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>Project not found</div>;

  // Group items by category
  const groupedItems = project.bomItems.reduce((groups, item) => {
    const category = item.kategori || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div className="project-page">
      <h2>Project: {project.projectName}</h2>
      <p>Project Code: {project.projectCode}</p>
      <p>Progress: {project.progress}</p>
      <h3>Items in this project:</h3>
      {Object.keys(groupedItems).map((category) => (
        <div key={category} className="category-group">
          <h4 className="category-title">{category}</h4>
          <table className="project-table">
            <thead>
              <tr>
                <th>ID BARANG</th>
                <th>MATERIAL PLAT &amp; PROFIL</th>
                <th>QTY/UNIT</th>
                <th>T. QTY</th>
                <th>SATUAN</th>
                <th>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems[category].map((item) => (
                  <tr
                    key={item.id}
                    className={
                      (keluarValues[item.id] || 0) >= item.totalQty
                        ? 'maxed-out-row'
                        : ''
                    }
                  >
                    <td>{item.idBarang}</td>
                    <td>{item.deskripsi}</td>
                    <td>{item.qtyPerUnit}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={item.totalQty}
                        value={inputValues[item.id] || ''}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="total-qty-input"
                        placeholder={`Max ${item.totalQty}`}
                        disabled={(keluarValues[item.id] || 0) >= item.totalQty}
                      />
                      {errorMessages[item.id] && (
                        <div className="error-message">{errorMessages[item.id]}</div>
                      )}
                      / {item.totalQty}
                    </td>
                    <td>{item.satuan}</td>
                    <td>{item.keterangan}</td>
                  </tr>

              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleSubmitAll} className="submit-all-button">Submit All</button>
      <Link to="/">Back to Projects</Link>
    </div>
  );
}

export default ProjectPage;
