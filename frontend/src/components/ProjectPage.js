import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import ProjectFormPrint from './ProjectFormPrint';
import './ProjectPage.css';

function ProjectPage({ isAdmin }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keluarValues, setKeluarValues] = useState({});
  const [checkedStatus, setCheckedStatus] = useState({});

  // OCR related states
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [ocrTableData, setOcrTableData] = useState([]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${id}`);
        setProject(res.data);

        // Initialize checkedStatus from bomItems
        const initialChecked = {};
        res.data.bomItems.forEach(item => {
          initialChecked[item.id] = item.checked || false;
        });
        setCheckedStatus(initialChecked);

        // Initialize keluarValues from localStorage on mount or default to 0
        const storedKeluarValues = localStorage.getItem(`keluarValues_${id}`);
        if (storedKeluarValues) {
          setKeluarValues(JSON.parse(storedKeluarValues));
        } else {
          const initialKeluar = {};
          res.data.bomItems.forEach(item => {
            initialKeluar[item.id] = 0;
          });
          setKeluarValues(initialKeluar);
        }
      } catch (err) {
        setError('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Save keluarValues to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(keluarValues).length > 0) {
      localStorage.setItem(`keluarValues_${id}`, JSON.stringify(keluarValues));
    }
  }, [keluarValues, id]);

  const [inputValues, setInputValues] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  const handleInputChange = (itemId, value) => {
    setInputValues(prev => ({ ...prev, [itemId]: value }));
    setErrorMessages(prev => ({ ...prev, [itemId]: '' }));
  };

  const handleCheckboxChange = async (itemId) => {
    const newChecked = !checkedStatus[itemId];
    setCheckedStatus(prev => ({ ...prev, [itemId]: newChecked }));

    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${id}/bomitems/${itemId}`, {
        checked: newChecked,
      });
    } catch (error) {
      setErrorMessages(prev => ({ ...prev, [itemId]: 'Failed to update status' }));
      // Revert checkbox state on failure
      setCheckedStatus(prev => ({ ...prev, [itemId]: !newChecked }));
    }
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

      // Allow input above max, so no error here

      try {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${project.id}/bomitems/${itemId}/keluar`, {
          tanggal: today,
          deskripsi,
          keluar: keluarValue,
          keterangan,
          namaProjek: projectName,
        });

        setKeluarValues(prev => ({ ...prev, [itemId]: newTotalKeluar }));
        setInputValues(prev => ({ ...prev, [itemId]: '' }));
        setErrorMessages(prev => ({ ...prev, [itemId]: '' }));

        // Auto update checked status based on newTotalKeluar and totalQty
        if (newTotalKeluar === totalQty) {
          await axios.put(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${id}/bomitems/${itemId}`, {
            checked: true,
          });
          setCheckedStatus(prev => ({ ...prev, [itemId]: true }));
        } else if (newTotalKeluar > totalQty) {
          await axios.put(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${id}/bomitems/${itemId}`, {
            checked: false,
          });
          setCheckedStatus(prev => ({ ...prev, [itemId]: false }));
        }
      } catch (error) {
        setErrorMessages(prev => ({ ...prev, [itemId]: 'Failed to save keluar' }));
        hasError = true;
      }
    }

    if (!hasError) {
      alert('All inputs saved successfully.');
    }
  };

  // OCR handlers
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setOcrResult('');
    setOcrError(null);
  };

  const preprocessImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply adaptive thresholding (simple local threshold)
        const width = canvas.width;
        const height = canvas.height;
        const newData = new Uint8ClampedArray(data.length);

        // Helper to get pixel grayscale
        const getGray = (x, y) => {
          const i = (y * width + x) * 4;
          return (data[i] + data[i + 1] + data[i + 2]) / 3;
        };

        // Compute local threshold for each pixel using 15x15 window
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0;
            let count = 0;
            for (let dy = -7; dy <= 7; dy++) {
              for (let dx = -7; dx <= 7; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  sum += getGray(nx, ny);
                  count++;
                }
              }
            }
            const localThreshold = sum / count;
            const i = (y * width + x) * 4;
            const gray = getGray(x, y);
            const val = gray > localThreshold ? 255 : 0;
            newData[i] = newData[i + 1] = newData[i + 2] = val;
            newData[i + 3] = 255;
          }
        }

        for (let i = 0; i < data.length; i++) {
          data[i] = newData[i];
        }

        ctx.putImageData(imageData, 0, 0);

        callback(canvas.toDataURL()); // base64 image
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOcrProcess = () => {
    if (!selectedFile) {
      setOcrError('Please select an image file first.');
      return;
    }

    setOcrLoading(true);
    setOcrError(null);

    preprocessImage(selectedFile, (preprocessedImage) => {
      Tesseract.recognize(
        preprocessedImage,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        console.log("=== OCR Lines ===");
        lines.forEach(line => console.log(line));

        // More flexible regex to extract itemId and quantity from each line
        const extractedItems = [];
        const itemIdRegex = /\b(\d{3,4})\b/;
        const qtyRegex = /(\d+(\.\d+)?)(?!.*\d)/; // last number in line

        lines.forEach(line => {
          const itemIdMatch = line.match(itemIdRegex);
          const qtyMatch = line.match(qtyRegex);

          if (itemIdMatch && qtyMatch) {
            const itemId = itemIdMatch[1];
            const qtyToWrite = qtyMatch[1];

            extractedItems.push({ itemId, qtyToWrite });
          }
        });

        console.log("=== Extracted Items with Qty ===");
        console.log(extractedItems);

        const newInputValues = {};
        extractedItems.forEach(({ itemId, qtyToWrite }) => {
          const bomItem = project.bomItems.find(item => item.id === itemId);
          if (bomItem) {
            newInputValues[itemId] = qtyToWrite;
          }
        });

        if (Object.keys(newInputValues).length > 0) {
          setInputValues(newInputValues);
          setOcrResult('OCR processing completed and inputs updated.');
        } else {
          setOcrError('Could not extract valid quantities.');
        }
      }).catch((err) => {
        console.error(err);
        setOcrError('OCR processing failed.');
      }).finally(() => {
        setOcrLoading(false);
      });
    });
  };


  const printRef = useRef();

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

  const getRowClassName = (item) => {
    const sumKeluar = keluarValues[item.id] || 0;
    const checked = checkedStatus[item.id] || false;
    if (sumKeluar > item.totalQty) {
      return 'red-row';
    }
    if (sumKeluar === item.totalQty) {
      return 'green-row';
    }
    if (sumKeluar < item.totalQty && checked) {
      return 'blue-row';
    }
    return '';
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="project-page">
      <h2>Project: {project.projectName}</h2>
      <p>Nomor SPK: {project.projectCode}</p>
      <p>Progress: <progress value={project.progress} max="1" style={{ width: '150px', height: '15px' }} /></p>
      {isAdmin && (
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this project?')) {
              try {
                await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/projects/${id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                });
                alert('Project deleted successfully.');
                window.location.href = '/';
              } catch (error) {
                alert('Failed to delete project.');
              }
            }
          }}
          style={{ marginBottom: '20px', backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete Project
        </button>
      )}

      {/* <button className="button-print"onClick={handlePrint} style={{ marginBottom: '20px' }}>
        <i class="fa-solid fa-print"> </i> Print Project Form

      </button>

      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <ProjectFormPrint project={project} />
        </div>
      </div>

      <div className="ocr-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button className="ocr-button"onClick={handleOcrProcess} disabled={ocrLoading}>
         <i class="fa-solid fa-qrcode"></i> {ocrLoading ? 'Processing OCR...' : 'Scan Gambar'}
        </button>
        {ocrError && <div className="error-message">{ocrError}</div>}
        {ocrResult && <div className="ocr-result">{ocrResult}</div>}
      </div> */}

      {Object.keys(groupedItems).map((category) => (
        <div key={category} className="category-group">
          <h4 className="category-title">{category}</h4>
          <table className="project-table">
            <thead>
              <tr>
                <th>Done</th>
                <th>ID BARANG</th>
                <th>MATERIAL PLAT &amp; PROFIL</th>
                <th>QTY/UNIT</th>
                <th>T. QTY</th>
                <th>SATUAN</th>
                <th>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems[category].map((item) => {
                const sumKeluar = keluarValues[item.id] || 0;
                const checked = checkedStatus[item.id] || false;
                return (
                  <tr key={item.id} className={getRowClassName(item)}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </td>
                    <td>{item.idBarang}</td>
                    <td>{item.deskripsi}</td>
                    <td>{item.qtyPerUnit}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={inputValues[item.id] || ''}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="total-qty-input"
                        placeholder={`Max ${item.totalQty}`}
                        disabled={checked}
                      />
                      {errorMessages[item.id] && (
                        <div className="error-message">{errorMessages[item.id]}</div>
                      )}
                      / {item.totalQty}
                    </td>
                    <td>{item.satuan}</td>
                    <td>{item.keterangan}</td>
                  </tr>
                );
              })}
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
