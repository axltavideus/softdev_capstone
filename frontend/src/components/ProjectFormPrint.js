import React from 'react';

function ProjectFormPrint({ project }) {
  if (!project) {
    return <div>No project data available for printing.</div>;
  }

  return (
    <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
      <h6>Project Name: {project.projectName}</h6>
      <h6>Project Code: {project.projectCode}</h6>
      <p style={{fontSize: '8px'}}>Please fill in the quantities in the "Quantity to Write" column. Use clear handwriting for best OCR results.</p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          fontSize: '11px',
          border: '2px solid black',
          borderSpacing: '0',
          borderStyle: 'solid',
          borderColor: 'black',
        }}
        border="1"
      >
        <thead>
          <tr>
            <th style={{ padding: '8px', border: '2px solid black' }}>Item ID</th>
            <th style={{ padding: '8px', border: '2px solid black' }}>Description</th>
            <th style={{ padding: '8px', border: '2px solid black' }}>Qty/Unit</th>
            <th style={{ padding: '8px', border: '2px solid black' }}>Total Qty</th>
            <th style={{ padding: '8px', border: '2px solid black' }}>Unit</th>
            <th style={{ padding: '8px', border: '2px solid black' }}>Quantity to Write</th>
          </tr>
        </thead>
        <tbody>
          {project.bomItems.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '8px', textAlign: 'center', border: '2px solid black' }}>{item.idBarang}</td>
              <td style={{ padding: '8px', border: '2px solid black' }}>{item.deskripsi}</td>
              <td style={{ padding: '8px', textAlign: 'center', border: '2px solid black' }}>{item.qtyPerUnit}</td>
              <td style={{ padding: '8px', textAlign: 'center', border: '2px solid black' }}>{item.totalQty}</td>
              <td style={{ padding: '8px', textAlign: 'center', border: '2px solid black' }}>{item.satuan}</td>
              <td style={{ padding: '8px', height: '30px', border: '2px solid black' }}></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '20px' }}>
        After filling this form, please scan it and upload the image for OCR processing.
      </p>
    </div>
  );
}

export default ProjectFormPrint;
