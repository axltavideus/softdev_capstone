import React, { useState, useEffect } from 'react';
import './master_data.css';

const MasterData = () => {
  const [bomItems, setBomItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValues, setInputValues] = useState({}); // store stok awal, masuk, keluar, stok akhir keyed by bomItem id
  const [editStokAwal, setEditStokAwal] = useState({}); // track which rows have stokAwal input visible

  // New state for new master data form
  const [newEntry, setNewEntry] = useState({
    idBarang: '',
    deskripsi: '',
    stokAwal: '',
  });

  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Replace with actual projectId or make dynamic
  const projectId = 1;

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

      // Hide input field after save
      setEditStokAwal((prev) => ({
        ...prev,
        [itemId]: false,
      }));

      // Refresh data
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
      setNewEntry({ idBarang: '', deskripsi: '', stokAwal: '' });
      setIsModalOpen(false);
      fetchMasterData();
    } catch (error) {
      console.error('Error adding new master data:', error);
    }
  };

  const handleDownload = () => {
    // Prepare CSV content
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

      <div className="search-container" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Masukkan Kode atau Deskripsi Barang"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          style={{ paddingLeft: '30px' }}
        />
        <i
          className="fa fa-search"
          style={{
            position: 'absolute',
            left: '10px',
            top: '40%',
            transform: 'translateY(-50%)',
            color: '#888',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

      {/* New entry form */}
      <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
        Tambahkan Barang
      </button>

      {/* Modal for new entry form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Master Data Entry</h2>
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
            <th>KODE BARANG</th>
            <th>DESKRIPSI</th>
            <th>STOK AWAL</th>
            <th>MASUK</th>
            <th>KELUAR</th>
            <th>STOCK AKHIR</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => {
            const inputs = inputValues[item.id] || {};
            return (
              <tr key={item.id}>
                <td>{item.idBarang}</td>
                <td>{item.deskripsi}</td>
                <td>
                  <input
                    type="number"
                    value={inputs.stokAwal !== undefined ? inputs.stokAwal : item.stokAwal || ''}
                    onChange={(e) => handleInputChange(e, item.id, 'stokAwal')}
                    onBlur={() => handleSaveStokAwal(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    className="input-cell"
                  />
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
