import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KeluarPage.css';

function KeluarPage() {
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingKeterangan, setEditingKeterangan] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedKeterangan, setExpandedKeterangan] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const fetchBarangKeluar = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/barangkeluar');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBarangKeluar(data);
      } catch (err) {
        setError('Failed to fetch barang keluar data');
      } finally {
        setLoading(false);
      }
    };
    fetchBarangKeluar();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeteranganChange = (id, value) => {
    setEditingKeterangan(prev => ({ ...prev, [id]: value }));
  };

  const handleKeteranganFocus = (id) => {
    setActiveEdit(id);
    setExpandedKeterangan(id);
    if (editingKeterangan[id] === undefined) {
      const item = barangKeluar.find(item => item.id === id);
      setEditingKeterangan(prev => ({ ...prev, [id]: item.keterangan || '' }));
    }
  };

  const handleKeteranganBlur = (id) => {
    if (editingKeterangan[id] !== undefined) {
      handleSaveKeterangan(id);
    }
    setActiveEdit(null);
    setExpandedKeterangan(null);
  };

  const handleSaveKeterangan = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/barangkeluar/${id}/keterangan`, {
        keterangan: editingKeterangan[id],
      });
      setBarangKeluar(prev =>
        prev.map(item =>
          item.id === id ? { ...item, keterangan: editingKeterangan[id] } : item
        )
      );
      setSuccessMessage('Keterangan updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveEdit(null);
      setExpandedKeterangan(null);
    } catch (err) {
      console.error('Failed to update keterangan', err);
    }
  };

  const handleCancelEdit = (id) => {
    setActiveEdit(null);
    setExpandedKeterangan(null);
    setEditingKeterangan(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };

  const handleDownload = () => {
    const headers = ['Tanggal', 'Kode Barang', 'Deskripsi', 'Keluar', 'Keterangan', 'Project'];
    const rows = barangKeluar.map(item => [
      item.tanggal,
      item.BomItem ? item.BomItem.idBarang : '-',
      item.deskripsi,
      item.keluar,
      item.keterangan || '-',
      item.namaProjek,
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\r\n';
    rows.forEach(row => {
      csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'barang_keluar.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBarangKeluar = barangKeluar.filter(item => {
    if (!item.BomItem || !item.BomItem.idBarang) return false;
    return item.BomItem.idBarang.toLowerCase().includes(search.toLowerCase());
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const sortedBarangKeluar = React.useMemo(() => {
    if (!sortConfig) return filteredBarangKeluar;
    const sorted = [...filteredBarangKeluar].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Special handling for nested BomItem.idBarang
      if (sortConfig.key === 'idBarang') {
        aValue = a.BomItem ? a.BomItem.idBarang : '';
        bValue = b.BomItem ? b.BomItem.idBarang : '';
      }

      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredBarangKeluar, sortConfig]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this barang keluar?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/barangkeluar/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete barang keluar');
      }
      setBarangKeluar((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage('Barang keluar deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error deleting barang keluar: ' + error.message);
    }
  };

  const handleEditClick = (item) => {
    setEditItem({ ...item });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/barangkeluar/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem),
      });
      if (!response.ok) throw new Error('Failed to update item');
      setSuccessMessage('Barang keluar updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setEditModalOpen(false);
      setEditItem(null);
      // Refresh data
      const res = await fetch('http://localhost:5000/api/barangkeluar');
      setBarangKeluar(await res.json());
    } catch (error) {
      alert('Failed to update barang keluar: ' + error.message);
    }
  };

  if (loading) return <div>Loading barang keluar data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="keluar-page">
      <h1>BARANG KELUAR</h1>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      {expandedKeterangan && (
        <div 
          className="keterangan-backdrop" 
          onClick={() => handleCancelEdit(expandedKeterangan)}
        />
      )}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Kode Barang"
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <i className="fa fa-search search-icon" aria-hidden="true" />
      </div>
      <div className="table-container">
        <table className="master-data-keluar-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('tanggal')} style={{ cursor: 'pointer' }}>
                Tanggal {sortConfig?.key === 'tanggal' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('idBarang')} style={{ cursor: 'pointer' }}>
                KODE BARANG {sortConfig?.key === 'idBarang' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('deskripsi')} style={{ cursor: 'pointer' }}>
                DESKRIPSI {sortConfig?.key === 'deskripsi' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('keluar')} style={{ cursor: 'pointer' }}>
                KELUAR {sortConfig?.key === 'keluar' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th>KET</th>
              <th onClick={() => handleSort('namaProjek')} style={{ cursor: 'pointer' }}>
                Project {sortConfig?.key === 'namaProjek' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {sortedBarangKeluar.map((item) => (
              <tr key={item.id}>
                <td>{item.tanggal}</td>
                <td>{item.BomItem ? item.BomItem.idBarang : '-'}</td>
                <td>{item.deskripsi}</td>
                <td>{item.keluar}</td>
                <td>
                  <div className={`keterangan-container ${expandedKeterangan === item.id ? 'expanded' : ''}`}>
                      {expandedKeterangan === item.id ? (
                        <>
                          <textarea
                            value={editingKeterangan[item.id] !== undefined ? editingKeterangan[item.id] : (item.keterangan || '')}
                            onChange={(e) => handleKeteranganChange(item.id, e.target.value)}
                            className="keterangan-textarea"
                            autoFocus
                            onBlur={() => handleKeteranganBlur(item.id)}
                          />
                          <div className="keterangan-actions">
                            <button
                              onClick={() => handleSaveKeterangan(item.id)}
                              className="confirm-button"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(item.id)}
                              className="cancel-button"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div 
                          className="keterangan-preview"
                          onClick={() => handleKeteranganFocus(item.id)}
                        >
                          {item.keterangan || <span className="empty-keterangan">Click to add keterangan</span>}
                        </div>
                      )}
                  </div>
                </td>
                <td>{item.namaProjek}</td>
                <td>
                  <div className="aksi-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(item)}
                      aria-label="Edit"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="download-button" onClick={handleDownload}>
        DOWNLOAD
      </button>
      {editModalOpen && editItem && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <span className="close" onClick={() => setEditModalOpen(false)}>&times;</span>
            <h2>Edit Barang Keluar</h2>
            <div className="edit-form-group">
              <label>Tanggal</label>
              <input
                type="date"
                name="tanggal"
                value={editItem.tanggal.split('T')[0]}
                onChange={handleEditChange}
                className="edit-input"
              />
            </div>
            <div className="edit-form-group">
              <label>Kode Barang</label>
              <input
                type="text"
                name="idBarang"
                value={editItem.BomItem ? editItem.BomItem.idBarang : ''}
                onChange={handleEditChange}
                className="edit-input"
                disabled
              />
            </div>
            <div className="edit-form-group">
              <label>Deskripsi</label>
              <input
                type="text"
                name="deskripsi"
                value={editItem.deskripsi}
                onChange={handleEditChange}
                className="edit-input"
              />
            </div>
            <div className="edit-form-group">
              <label>Keluar</label>
              <input
                type="number"
                name="keluar"
                value={editItem.keluar}
                onChange={handleEditChange}
                className="edit-input"
              />
            </div>
            <div className="edit-form-group">
              <label>Keterangan</label>
              <textarea
                name="keterangan"
                value={editItem.keterangan}
                onChange={handleEditChange}
                className="edit-textarea"
              />
            </div>
            <div className="edit-form-group">
              <label>Project</label>
              <input
                type="text"
                name="namaProjek"
                value={editItem.namaProjek}
                onChange={handleEditChange}
                className="edit-input"
              />
            </div>
            <div className="edit-actions">
              <button onClick={handleEditSave} className="save-button">
                Save Changes
              </button>
              <button onClick={() => setEditModalOpen(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default KeluarPage;