import React, { useState, useEffect } from 'react';
import './MasterDataMasukPage.css';

const initialData = [];

function MasterDataMasukPage() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({
    tanggal: '',
    kodeBarang: '',
    deskripsi: '',
    masuk: '',
    ket: '',
  });

  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          ket: item.keterangan,
        })));
      } catch (error) {
        alert('Error fetching data: ' + error.message);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = async () => {
    if (
      !newEntry.tanggal ||
      !newEntry.kodeBarang ||
      !newEntry.deskripsi ||
      !newEntry.ket
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
          keterangan: newEntry.ket,
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
        ket: savedEntry.keterangan,
      }]);
      setNewEntry({
        tanggal: '',
        kodeBarang: '',
        deskripsi: '',
        masuk: '',
        ket: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  return (
    <div className="masterdata-masuk-page">
      <h1>MASTER DATA (MASUK)</h1>
      <div className="search-container" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Masukkan Kode atau Deskripsi Barang"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ paddingLeft: '30px' }}
        />
        <i
          className="fa fa-search"
          style={{
            position: 'absolute',
            right: '10px',
            top: '40%',
            transform: 'translateY(-50%)',
            color: '#888',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Button to open modal */}
      <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
        Tambahkan Barang
      </button>

      {/* Modal for add entry form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Data Masuk</h2>
            <input
              type="text"
              name="tanggal"
              placeholder="Tanggal (DD/MM/YYYY)"
              value={newEntry.tanggal}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="text"
              name="kodeBarang"
              placeholder="Kode Barang"
              value={newEntry.kodeBarang}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="text"
              name="deskripsi"
              placeholder="Deskripsi"
              value={newEntry.deskripsi}
              onChange={handleInputChange}
              className="form-input"
            />
            <input
              type="number"
              name="masuk"
              placeholder="Masuk"
              value={newEntry.masuk}
              onChange={handleInputChange}
              className="form-input"
              min="0"
            />
            <input
              type="text"
              name="ket"
              placeholder="Keterangan"
              value={newEntry.ket}
              onChange={handleInputChange}
              className="form-input"
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

      <table className="masuk-table">
        <thead>
          <tr>
            <th>TANGGAL</th>
            <th>KODE BARANG</th>
            <th>DESKRIPSI</th>
            <th>MASUK</th>
            <th>KET</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.tanggal}</td>
              <td>{item.kodeBarang}</td>
              <td>{item.deskripsi}</td>
              <td>{item.masuk}</td>
              <td>{item.ket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterDataMasukPage;
