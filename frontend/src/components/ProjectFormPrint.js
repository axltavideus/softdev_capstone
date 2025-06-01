import React from 'react';

function ProjectFormPrint({ project }) {
  if (!project) {
    return <div>No project data available for printing.</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Project Form</h1>
      <h2>Project Name: {project.projectName}</h2>
      <h3>Project Code: {project.projectCode}</h3>
      <p>Please fill in the quantities in the "Quantity to Write" column. Use clear handwriting for best OCR results.</p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          fontSize: '14px',
        }}
        border="1"
      >
        <thead>
          <tr>
            <th style={{ padding: '8px' }}>Item ID</th>
            <th style={{ padding: '8px' }}>Description</th>
            <th style={{ padding: '8px' }}>Qty/Unit</th>
            <th style={{ padding: '8px' }}>Total Qty</th>
            <th style={{ padding: '8px' }}>Unit</th>
            <th style={{ padding: '8px' }}>Quantity to Write</th>
          </tr>
        </thead>
        <tbody>
          {project.bomItems.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: '8px', textAlign: 'center' }}>{item.idBarang}</td>
              <td style={{ padding: '8px' }}>{item.deskripsi}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{item.qtyPerUnit}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{item.totalQty}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>{item.satuan}</td>
              <td style={{ padding: '8px', height: '30px' }}></td>
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
