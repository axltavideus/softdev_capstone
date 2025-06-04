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

  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const kodeBarangInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/barangmasuk');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const fetchedData = await response.json();
        setData(fetchedData.map(item => ({
          tanggal: item.tanggal,
          kodeBarang: item.kodeBarang,
          deskripsi: item.deskripsi,
          masuk: item.masuk,
          keterangan: item.keterangan,
          id: item.id
        })));
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
        if (!response.ok) {
          throw new Error('Failed to fetch master data');
        }
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    if (!window.confirm('Are you sure you want to delete this data masuk?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/barangmasuk/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete data masuk');
      }
      setData((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage('Data masuk deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error deleting data masuk: ' + error.message);
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
      // Clear deskripsi if kodeBarang is manually changed
      setNewEntry((prev) => ({ ...prev, deskripsi: '' }));
    } else {
      setNewEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectItem = (item) => {
    console.log('handleSelectItem called with item:', item);
    setNewEntry((prev) => ({
      ...prev,
      kodeBarang: item.idBarang,
      deskripsi: item.deskripsi,
    }));
    // Hide dropdown immediately after item selection
    setShowDropdown(false);
    if (kodeBarangInputRef.current) {
      kodeBarangInputRef.current.focus();
    }
  };

  const handleKetChange = (index, value) => {
    setEditingKet(prev => ({ ...prev, [index]: value }));
  };

  const handleKetFocus = (index) => {
    setActiveEdit(index);
  };

  const handleKetBlur = async (index) => {
    if (editingKet[index] !== undefined) {
      await handleSaveKet(index);
    }
    setActiveEdit(null);
  };

  const handleSaveKet = async (index) => {
    if (editingKet[index] !== undefined) {
      try {
        const item = filteredData[index];
        await axios.put(`http://localhost:5000/api/barangmasuk/${item.id}/keterangan`, {
          keterangan: editingKet[index],
        });
        setData(prev =>
          prev.map((d, i) =>
            i === index ? { ...d, keterangan: editingKet[index] } : d
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

  const handleAddEntry = async () => {
    if (
      !newEntry.tanggal ||
      !newEntry.kodeBarang ||
      !newEntry.deskripsi
    ) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/barangmasuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal: newEntry.tanggal,
          kodeBarang: newEntry.kodeBarang,
          deskripsi: newEntry.deskripsi,
          masuk: parseFloat(newEntry.masuk),
          keterangan: newEntry.keterangan,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      const savedEntry = await response.json();
      setData((prev) => [...prev, {
        tanggal: savedEntry.tanggal,
        kodeBarang: savedEntry.kodeBarang,
        deskripsi: savedEntry.deskripsi,
        masuk: savedEntry.masuk,
        keterangan: savedEntry.keterangan,
      }]);
      setNewEntry({
        tanggal: '',
        kodeBarang: '',
        deskripsi: '',
        masuk: '',
        keterangan: '',
      });
      setIsModalOpen(false);
      setSuccessMessage('Data masuk added successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  const handleDownload = () => {
    const headers = ['Tanggal', 'Kode Barang', 'Deskripsi', 'Masuk', 'Keterangan'];
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
    link.setAttribute('download', 'master_data_masuk.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="master-data-container">
      <h1>MASTER DATA (MASUK)</h1>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <i class="fa-solid fa-check"></i>
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
              placeholder="Tanggal (DD/MM/YYYY)"
              value={newEntry.tanggal || ''}
              onChange={handleInputChange}
              className="new-entry-input"
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
              if (newEntry && newEntry.kodeBarang && newEntry.kodeBarang.length > 0) {
                const filtered = masterData.filter((item) =>
                  item.idBarang && item.idBarang.toLowerCase().includes(newEntry.kodeBarang.toLowerCase())
                );
                setFilteredMasterData(filtered);
                setShowDropdown(true);
              }
              }}
              style={{ display: 'block' }}
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
            />
            <input
              type="number"
              name="masuk"
              placeholder="Masuk"
              value={newEntry.masuk || ''}
              onChange={handleInputChange}
              className="new-entry-input"
              min="0"
            />
            <input
              type="text"
              name="keterangan"
              placeholder="Keterangan"
              value={newEntry.keterangan || ''}
              onChange={handleInputChange}
              className="new-entry-input"
            />
            <div className="modal-buttons">
              <button onClick={handleAddEntry} className="add-entry-button">
                Masukkan Barang
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
            <th>KETERANGAN</th>
            {isAdmin && <th>AKSI</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td>{item.tanggal}</td>
              <td>{item.kodeBarang}</td>
              <td>{item.deskripsi}</td>
              <td>{item.masuk}</td>
              <td>
                <div className="keterangan-container">
                  <input
                    type="text"
                    value={editingKet[index] !== undefined ? editingKet[index] : (item.keterangan || '')}
                    onChange={(e) => handleKetChange(index, e.target.value)}
                    onFocus={() => handleKetFocus(index)}
                    onBlur={() => handleKetBlur(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    className="input-cell"
                  />
                  {activeEdit === index && (
                    <button
                      onClick={() => handleSaveKet(index)}
                      className="confirm-button"
                      aria-label="Save Keterangan"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </td>
              {isAdmin && (
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                  >
                    Hapus
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      <button className="download-button" onClick={handleDownload}>
        DOWNLOAD
      </button>
    </div>
  );
}

export default MasterDataMasukPage;