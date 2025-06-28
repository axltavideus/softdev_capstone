import React, { useState, useEffect, useRef } from 'react';
import './MasterDataMasukPage.css';

function MasterDataMasukPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKet, setEditingKet] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newEntry, setNewEntry] = useState({
    tanggal: '',
    kodeBarang: '',
    deskripsi: '',
    masuk: '',
    keterangan: '',
  });

  const [masterData, setMasterData] = useState([]);
  const [filteredMasterData, setFilteredMasterData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeEditRow, setActiveEditRow] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});

  const kodeBarangInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/barangmasuk');
        if (!response.ok) throw new Error('Failed to fetch data');
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (error) {
        alert('Error fetching data: ' + error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/masterdata');
        if (!response.ok) throw new Error('Failed to fetch master data');
        const fetchedMasterData = await response.json();
        setMasterData(fetchedMasterData);
      } catch (error) {
        alert('Error fetching master data: ' + error.message);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const user = await response.json();
        setIsAdmin(user.isAdmin === true);
      } catch (err) {
        setIsAdmin(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
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
  }, [filteredData, sortConfig]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/barangmasuk/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete data');
      setData((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage('Entry deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error deleting data: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'kodeBarang') {
      setNewEntry((prev) => ({ ...prev, kodeBarang: value }));
      if (value.length > 0) {
        const filtered = masterData.filter((item) =>
          item.idBarang && item.idBarang.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredMasterData(filtered);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
      setNewEntry((prev) => ({ ...prev, deskripsi: '' }));
    } else {
      setNewEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectItem = (item) => {
    setNewEntry((prev) => ({
      ...prev,
      kodeBarang: item.idBarang,
      deskripsi: item.deskripsi,
    }));
    setShowDropdown(false);
    if (kodeBarangInputRef.current) kodeBarangInputRef.current.focus();
  };

  const handleKetChange = (index, value) => {
    setEditingKet(prev => ({ ...prev, [index]: value }));
  };

  const handleKetFocus = (index) => {
    setActiveEdit(index);
    setEditingKet(prev => ({
      ...prev,
      [index]: prev[index] === undefined ? data.find((_, i) => i === index)?.keterangan || '' : prev[index]
    }));
  };

  const handleSaveKet = async (index) => {
    try {
      const item = sortedData[index];
      if (!item || !item.id) throw new Error('Invalid item or missing ID');

      const keterangan = editingKet[index];
      if (keterangan === undefined) throw new Error('No vendor/supplier information to save');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:5000/api/barangmasuk/${item.id}/keterangan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keterangan })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update vendor/supplier information');
      }

      setData(prev =>
        prev.map(d => 
          d.id === item.id ? { ...d, keterangan } : d
        )
      );

      setSuccessMessage('Vendor/Supplier information updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveEdit(null);
    } catch (err) {
      console.error('Error updating vendor/supplier:', err);
      setSuccessMessage(`Failed to update: ${err.message}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.tanggal || !newEntry.kodeBarang || !newEntry.deskripsi) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/barangmasuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: newEntry.tanggal,
          kodeBarang: newEntry.kodeBarang,
          deskripsi: newEntry.deskripsi,
          masuk: parseFloat(newEntry.masuk) || 0,
          keterangan: newEntry.keterangan,
        }),
      });
      if (!response.ok) throw new Error('Failed to save data');
      const savedEntry = await response.json();
      setData((prev) => [...prev, savedEntry]);
      setNewEntry({
        tanggal: '',
        kodeBarang: '',
        deskripsi: '',
        masuk: '',
        keterangan: '',
      });
      setIsModalOpen(false);
      setSuccessMessage('Entry added successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  const handleDownload = () => {
    const headers = ['Tanggal', 'Kode Barang', 'Deskripsi', 'Masuk', 'Vendor/Supplier'];
    const rows = filteredData.map(item => [
      item.tanggal,
      item.kodeBarang,
      item.deskripsi,
      item.masuk,
      item.keterangan || '-',
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\r\n';
    rows.forEach(row => {
      csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'barang_masuk.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditRow = (index) => {
    setActiveEditRow(index);
    setEditingRowData({ ...sortedData[index] });
  };

  const handleSaveRow = async (index) => {
    try {
      const item = sortedData[index];
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/barangmasuk/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRowData),
      });
      if (!response.ok) throw new Error('Failed to update data');
      setSuccessMessage('Entry updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveEditRow(null);
      setEditingRowData({});
      const res = await fetch('http://localhost:5000/api/barangmasuk');
      setData(await res.json());
    } catch (error) {
      alert('Failed to update data: ' + error.message);
    }
  };

  const handleCancelEditRow = () => {
    setActiveEditRow(null);
    setEditingRowData({});
  };

  const handleEditRowChange = (e) => {
    const { name, value } = e.target;
    setEditingRowData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="master-data-container">
      <h1>BARANG MASUK</h1>
      
      {showSuccess && (
        <div className={`success-popup ${successMessage.includes('Failed') ? 'error' : ''}`}>
          <div className="success-content">
            {successMessage.includes('Failed') ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-check"></i>
            )}
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Masukkan Kode atau Deskripsi Barang"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <i className="fa fa-search search-icon" aria-hidden="true" />
      </div>

      <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
        Tambahkan Barang
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Data Masuk</h2>
            <input
              type="date"
              name="tanggal"
              value={newEntry.tanggal || ''}
              onChange={handleInputChange}
              className="new-entry-input"
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="kodeBarang"
                placeholder="Kode Barang"
                value={newEntry.kodeBarang || ''}
                onChange={handleInputChange}
                className="new-entry-input"
                autoComplete="off"
                ref={kodeBarangInputRef}
                onFocus={() => {
                  if (newEntry.kodeBarang?.length > 0) {
                    const filtered = masterData.filter((item) =>
                      item.idBarang?.toLowerCase().includes(newEntry.kodeBarang.toLowerCase())
                    );
                    setFilteredMasterData(filtered);
                    setShowDropdown(true);
                  }
                }}
                required
              />
              {showDropdown && filteredMasterData.length > 0 && (
                <ul className="autocomplete-dropdown">
                  {filteredMasterData.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectItem(item)}
                      className="autocomplete-item"
                    >
                      {item.idBarang} - {item.deskripsi}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="text"
              name="deskripsi"
              placeholder="Deskripsi"
              value={newEntry.deskripsi || ''}
              onChange={handleInputChange}
              className="new-entry-input"
              readOnly
              required
            />
            <input
              type="number"
              name="masuk"
              placeholder="Jumlah Masuk"
              value={newEntry.masuk || ''}
              onChange={handleInputChange}
              className="new-entry-input"
              min="0"
              required
            />
            <input
              type="text"
              name="keterangan"
              placeholder="Vendor/Supplier"
              value={newEntry.keterangan || ''}
              onChange={handleInputChange}
              className="new-entry-input"
            />
            <div className="modal-buttons">
              <button onClick={handleAddEntry} className="add-entry-button">
                Simpan
              </button>
              <button onClick={() => setIsModalOpen(false)} className="cancel-button">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="masuk-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('tanggal')} style={{ cursor: 'pointer' }}>
                TANGGAL {sortConfig?.key === 'tanggal' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('kodeBarang')} style={{ cursor: 'pointer' }}>
                KODE BARANG {sortConfig?.key === 'kodeBarang' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('deskripsi')} style={{ cursor: 'pointer' }}>
                DESKRIPSI {sortConfig?.key === 'deskripsi' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('masuk')} style={{ cursor: 'pointer' }}>
                MASUK {sortConfig?.key === 'masuk' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th>VENDOR/SUPPLIER</th>
              {isAdmin && <th>AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td>
                  {activeEditRow === index ? (
                    <input
                      type="date"
                      name="tanggal"
                      value={editingRowData.tanggal}
                      onChange={handleEditRowChange}
                      className="input-cell"
                    />
                  ) : (
                    item.tanggal
                  )}
                </td>
                <td>
                  {activeEditRow === index ? (
                    <input
                      type="text"
                      name="kodeBarang"
                      value={editingRowData.kodeBarang}
                      onChange={handleEditRowChange}
                      className="input-cell"
                    />
                  ) : (
                    item.kodeBarang
                  )}
                </td>
                <td>
                  {activeEditRow === index ? (
                    <input
                      type="text"
                      name="deskripsi"
                      value={editingRowData.deskripsi}
                      onChange={handleEditRowChange}
                      className="input-cell"
                    />
                  ) : (
                    item.deskripsi
                  )}
                </td>
                <td>
                  {activeEditRow === index ? (
                    <input
                      type="number"
                      name="masuk"
                      value={editingRowData.masuk}
                      onChange={handleEditRowChange}
                      className="input-cell"
                      min="0"
                    />
                  ) : (
                    item.masuk
                  )}
                </td>
                <td>
                  {activeEdit === index ? (
                    <>
                      <div className="vendor-input-overlay" onClick={() => setActiveEdit(null)} />
                      <div className="vendor-input-container">
                        <textarea
                          value={editingKet[index] !== undefined ? editingKet[index] : (item.keterangan || '')}
                          onChange={(e) => handleKetChange(index, e.target.value)}
                          className="vendor-input"
                          rows="4"
                          autoFocus
                          placeholder="Enter vendor/supplier information..."
                        />
                        <div className="vendor-input-buttons">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveKet(index);
                            }}
                            className="confirm-button"
                          >
                            <i className="fa-solid fa-check"></i> Simpan
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEdit(null);
                            }}
                            className="cancel-button"
                          >
                            <i className="fa-solid fa-times"></i> Batal
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="vendor-display" 
                      onClick={() => {
                        setEditingKet(prev => ({
                          ...prev,
                          [index]: item.keterangan || ''
                        }));
                        setActiveEdit(index);
                      }}
                    >
                      {item.keterangan || <span className="placeholder">Klik untuk tambah vendor/supplier</span>}
                    </div>
                  )}
                </td>
                {isAdmin && (
                  <td>
                    <div className="aksi-buttons">
                      {activeEditRow === index ? (
                        <>
                          <button 
                            className="confirm-button" 
                            onClick={() => handleSaveRow(index)}
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button 
                            className="cancel-button" 
                            onClick={handleCancelEditRow}
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="edit-button"
                            onClick={() => handleEditRow(index)}
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
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button className="download-button" onClick={handleDownload}>
        DOWNLOAD CSV
      </button>

      {editModalOpen && editItem && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Data Masuk</h2>
            <input
              type="date"
              name="tanggal"
              value={editItem.tanggal}
              onChange={e => setEditItem(prev => ({ ...prev, tanggal: e.target.value }))}
              className="new-entry-input"
            />
            <input
              type="text"
              name="kodeBarang"
              value={editItem.kodeBarang}
              onChange={e => setEditItem(prev => ({ ...prev, kodeBarang: e.target.value }))}
              className="new-entry-input"
              readOnly
            />
            <input
              type="text"
              name="deskripsi"
              value={editItem.deskripsi}
              onChange={e => setEditItem(prev => ({ ...prev, deskripsi: e.target.value }))}
              className="new-entry-input"
              readOnly
            />
            <input
              type="number"
              name="masuk"
              value={editItem.masuk}
              onChange={e => setEditItem(prev => ({ ...prev, masuk: e.target.value }))}
              className="new-entry-input"
              min="0"
            />
            <input
              type="text"
              name="keterangan"
              value={editItem.keterangan || ''}
              onChange={e => setEditItem(prev => ({ ...prev, keterangan: e.target.value }))}
              className="new-entry-input"
            />
            <div className="modal-buttons">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5000/api/barangmasuk/${editItem.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(editItem),
                    });
                    if (!response.ok) throw new Error('Failed to update data');
                    setSuccessMessage('Data updated successfully!');
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                    setEditModalOpen(false);
                    setEditItem(null);
                    const res = await fetch('http://localhost:5000/api/barangmasuk');
                    setData(await res.json());
                  } catch (error) {
                    alert('Failed to update data: ' + error.message);
                  }
                }}
                className="add-entry-button"
              >
                Simpan
              </button>
              <button onClick={() => setEditModalOpen(false)} className="cancel-button">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDataMasukPage;