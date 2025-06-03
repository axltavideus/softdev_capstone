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
  };

  const handleKeteranganBlur = async (id) => {
    if (editingKeterangan[id] !== undefined) {
      await handleSaveKeterangan(id);
    }
    setActiveEdit(null);
  };

  const handleSaveKeterangan = async (id) => {
    if (editingKeterangan[id] !== undefined) {
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
      } catch (err) {
        console.error('Failed to update keterangan', err);
      }
    }
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

  if (loading) return <div>Loading barang keluar data...</div>;
  if (error) return <div>{error}</div>;

  const filteredBarangKeluar = barangKeluar.filter(item => {
    if (!item.BomItem || !item.BomItem.idBarang) return false;
    return item.BomItem.idBarang.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="keluar-page">
      <h1>MASTER DATA (KELUAR)</h1>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <p>{successMessage}</p>
          </div>
        </div>
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
      <table className="keluar-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>KODE BARANG</th>
            <th>DESKRIPSI</th>
            <th>KELUAR</th>
            <th>KET</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {filteredBarangKeluar.map((item) => (
            <tr key={item.id}>
              <td>{item.tanggal}</td>
              <td>{item.BomItem ? item.BomItem.idBarang : '-'}</td>
              <td>{item.deskripsi}</td>
              <td>{item.keluar}</td>
              <td>
                <div className="keterangan-container">
                  <input
                    type="text"
                    value={editingKeterangan[item.id] !== undefined ? editingKeterangan[item.id] : (item.keterangan || '')}
                    onChange={(e) => handleKeteranganChange(item.id, e.target.value)}
                    onFocus={() => handleKeteranganFocus(item.id)}
                    onBlur={() => handleKeteranganBlur(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    className="input-cell"
                  />
                  {activeEdit === item.id && (
                    <button
                      onClick={() => handleSaveKeterangan(item.id)}
                      className="confirm-button"
                      aria-label="Save Keterangan"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </td>
              <td>{item.namaProjek}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="download-button" onClick={handleDownload}>
        DOWNLOAD
      </button>
    </div>
  );
}

export default KeluarPage;
