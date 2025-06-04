import React, { useState, useEffect } from 'react';
import './master_data.css';

const MasterData = () => {
  const [bomItems, setBomItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newEntry, setNewEntry] = useState({
    idBarang: '',
    deskripsi: '',
    stokAwal: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = React.useMemo(() => {
    if (!sortConfig) return filteredItems;

    const sorted = [...filteredItems].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (sortConfig.direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });
    return sorted;
  }, [filteredItems, sortConfig]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/masterdata`);
      if (!response.ok) {
        throw new Error('Failed to fetch master data');
      }
      const data = await response.json();
      setBomItems(data);
      setFilteredItems(data);
      
      const initialInputValues = {};
      data.forEach(item => {
        initialInputValues[item.id] = {
          stokAwal: item.stokAwal || '',
          masuk: item.masuk || '',
          keluar: item.keluar || '',
          stokAkhir: item.stockAkhir || ''
        };
      });
      setInputValues(initialInputValues);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredItems(bomItems);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = bomItems.filter(
        (item) =>
          (item.idBarang && item.idBarang.toString().toLowerCase().includes(lowerValue)) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(lowerValue))
      );
      setFilteredItems(filtered);
    }
  };

  const handleInputChange = (e, itemId, field) => {
    const value = e.target.value;
    setInputValues((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleStokAwalFocus = (itemId) => {
    setActiveEdit(itemId);
  };

  const handleStokAwalBlur = (itemId) => {
    setTimeout(() => setActiveEdit(null), 200);
  };

  const handleSaveStokAwal = async (itemId) => {
    const inputs = inputValues[itemId];
    if (!inputs || inputs.stokAwal === undefined) return;

    try {
      const itemToUpdate = filteredItems.find((item) => item.id === itemId);
      if (!itemToUpdate) return;

      const response = await fetch(`http://localhost:5000/api/masterdata/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemToUpdate,
          stokAwal: parseInt(inputs.stokAwal) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update stokAwal');
      }

      setSuccessMessage(`Stok Awal for ${itemToUpdate.idBarang} updated successfully!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveEdit(null);
      fetchMasterData();
    } catch (error) {
      console.error('Error updating stokAwal:', error);
      alert('Failed to update Stok Awal');
    }
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewEntry = async () => {
    if (!newEntry.idBarang || !newEntry.deskripsi) {
      alert('Kode Barang and Deskripsi are required');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/masterdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idBarang: newEntry.idBarang,
          deskripsi: newEntry.deskripsi,
          stokAwal: parseInt(newEntry.stokAwal) || 0,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add new master data');
      }
      
      setSuccessMessage(`New item ${newEntry.idBarang} added successfully!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setNewEntry({ idBarang: '', deskripsi: '', stokAwal: '' });
      setIsModalOpen(false);
      fetchMasterData();
    } catch (error) {
      console.error('Error adding new master data:', error);
    }
  };

  const handleDownload = () => {
    const headers = ['Kode Barang', 'Deskripsi', 'Stok Awal', 'Masuk', 'Keluar', 'Stock Akhir'];
    const rows = filteredItems.map((item) => {
      const inputs = inputValues[item.id] || {};
      return [
        item.idBarang || '',
        item.deskripsi || '',
        inputs.stokAwal || '',
        inputs.masuk || '',
        inputs.keluar || '',
        inputs.stokAkhir || '',
      ];
    });

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\r\n';
    rows.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'master_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="master-data-container">
      <h1>MASTER DATA</h1>

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
          placeholder="Masukkan Kode atau Deskripsi Barang"
          value={searchTerm}
          onChange={handleSearchChange}
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
            <h2>Tambahkan Master Data Baru</h2>
            <input
              type="text"
              name="idBarang"
              placeholder="Kode Barang"
              value={newEntry.idBarang}
              onChange={handleNewEntryChange}
              className="new-entry-input"
            />
            <input
              type="text"
              name="deskripsi"
              placeholder="Deskripsi"
              value={newEntry.deskripsi}
              onChange={handleNewEntryChange}
              className="new-entry-input"
            />
            <input
              type="number"
              name="stokAwal"
              placeholder="Stok Awal"
              value={newEntry.stokAwal}
              onChange={handleNewEntryChange}
              className="new-entry-input"
            />
            <div className="modal-buttons">
              <button onClick={handleAddNewEntry} className="add-entry-button">
                Add New
              </button>
              <button onClick={() => setIsModalOpen(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="master-data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('idBarang')} style={{ cursor: 'pointer' }}>
              KODE BARANG {sortConfig?.key === 'idBarang' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('deskripsi')} style={{ cursor: 'pointer' }}>
              DESKRIPSI {sortConfig?.key === 'deskripsi' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('stokAwal')} style={{ cursor: 'pointer' }}>
              STOK AWAL {sortConfig?.key === 'stokAwal' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('masuk')} style={{ cursor: 'pointer' }}>
              MASUK {sortConfig?.key === 'masuk' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('keluar')} style={{ cursor: 'pointer' }}>
              KELUAR {sortConfig?.key === 'keluar' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('stokAkhir')} style={{ cursor: 'pointer' }}>
              STOCK AKHIR {sortConfig?.key === 'stokAkhir' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => {
            const inputs = inputValues[item.id] || {};
            return (
              <tr key={item.id}>
                <td>{item.idBarang}</td>
                <td>{item.deskripsi}</td>
                <td>
                  <div className="stok-awal-container">
                    <input
                      type="number"
                      value={inputs.stokAwal}
                      onChange={(e) => handleInputChange(e, item.id, 'stokAwal')}
                      onFocus={() => handleStokAwalFocus(item.id)}
                      onBlur={() => handleStokAwalBlur(item.id)}
                      className="input-cell"
                    />
                    {activeEdit === item.id && (
                      <button 
                        onClick={() => handleSaveStokAwal(item.id)}
                        className="confirm-button"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </td>
                <td>{item.masuk !== undefined ? Number(item.masuk).toFixed(2) : '-'}</td>
                <td>{item.keluar !== undefined ? Number(item.keluar).toFixed(2) : '-'}</td>
                <td>{item.stockAkhir !== undefined ? Number(item.stockAkhir).toFixed(2) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className="download-button" onClick={handleDownload}>
        DOWNLOAD
      </button>
    </div>
  );
};

export default MasterData;