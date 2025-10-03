import React, { useMemo, useState } from 'react';
import { useUploadDocuments, useIngestionStatus } from '../api/hooks';

const DocumentUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const { mutateAsync: uploadDocuments, isLoading } = useUploadDocuments();
  const { data: status } = useIngestionStatus(jobId, Boolean(jobId));

  const progress = useMemo(() => {
    if (!status) return 0;
    if (!status.total_files) return 0;
    return Math.round((status.processed_files / status.total_files) * 100);
  }, [status]);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((file) => ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type));
    setSelectedFiles(valid);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    const response = await uploadDocuments(selectedFiles);
    setJobId(response.job_id);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Document Uploader</h3>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: '2px dashed var(--gray-700)',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--gray-800)',
          cursor: 'pointer'
        }}
      >
        <p style={{ marginBottom: '1rem', color: 'var(--gray-300)', fontSize: '0.875rem' }}>
          Drag and drop resumes, contracts, or reviews here, or choose from your computer.
        </p>
        <input
          type="file"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          style={{ display: 'block', margin: '0 auto', fontSize: '0.875rem' }}
        />
      </div>
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--gray-300)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {selectedFiles.length} files selected.
          </p>
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? 'Uploading…' : 'Upload & Process'}
          </button>
        </div>
      )}
      {status && (
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--gray-300)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Status: {status.status}
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {status.errors?.length > 0 && (
            <ul style={{ color: 'var(--gray-400)', marginTop: '0.75rem', fontSize: '0.875rem' }}>
              {status.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
