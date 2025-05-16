import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ProjectPage.css';

function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(res.data);

        // Initialize checked state from fetched data
        const initialChecked = {};
        res.data.bomItems.forEach(item => {
          initialChecked[item.id] = item.checked || false;
        });
        setCheckedItems(initialChecked);
      } catch (err) {
        setError('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleCheckChange = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
                <th>Checked</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems[category].map((item) => (
                <tr key={item.id}>
                  <td>{item.idBarang}</td>
                  <td>{item.deskripsi}</td>
                  <td>{item.qtyPerUnit}</td>
                  <td>{item.totalQty}</td>
                  <td>{item.satuan}</td>
                  <td>{item.keterangan}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={checkedItems[item.id] || false}
                      onChange={() => handleCheckChange(item.id)}
                      className="checked-checkbox"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <Link to="/">Back to Projects</Link>
    </div>
  );
}

export default ProjectPage;
