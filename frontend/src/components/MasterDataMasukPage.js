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
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  };

  return (
    <div className="masterdata-masuk-page">
      <h1>MASTER DATA(MASUK)</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Masukkan Kode atau Deskripsi Barang"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="add-entry-form">
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
        <button className="masukkan-barang-button" onClick={handleAddEntry}>
          MASUKKAN BARANG
        </button>
      </div>
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
              <td><b>{item.tanggal}</b></td>
              <td><b>{item.kodeBarang}</b></td>
              <td>{item.deskripsi}</td>
              <td><b>{item.masuk}</b></td>
              <td>{item.ket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterDataMasukPage;
