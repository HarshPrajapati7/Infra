import React, { useMemo, useState } from 'react';

const paginate = (rows, pageSize, pageIndex) => {
  const start = pageIndex * pageSize;
  return rows.slice(start, start + pageSize);
};

const ResultsView = ({ result }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const pagedRows = useMemo(() => {
    if (!result?.table_results) return [];
    return paginate(result.table_results, pageSize, pageIndex);
  }, [result, pageIndex]);

  const headers = useMemo(() => {
    if (!pagedRows?.length) return [];
    return Object.keys(pagedRows[0]);
  }, [pagedRows]);

  const handleExport = (type) => {
    if (!result) return;
    const data = type === 'json' ? JSON.stringify(result.table_results, null, 2) : convertToCsv(result.table_results);
    const blob = new Blob([data], { type: type === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `query-results.${type}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">Results</h3>
        </div>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
          Run a query to see structured and document insights.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Results</h3>
      </div>
      <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        {result.table_results?.length ?? 0} rows • {result.document_results?.length ?? 0} documents • {result.performance?.elapsed_seconds}s
      </p>
      {headers.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((header) => (
                    <td key={header}>{String(row[header] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.table_results.length > pageSize && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="secondary" disabled={pageIndex === 0} onClick={() => setPageIndex((p) => Math.max(0, p - 1))}>
                Previous
              </button>
              <button
                className="secondary"
                disabled={(pageIndex + 1) * pageSize >= result.table_results.length}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {result.document_results?.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {result.document_results.map((doc) => (
            <article 
              key={`${doc.file_name}-${doc.chunk_index}`} 
              style={{ 
                border: '1px solid var(--gray-700)', 
                borderRadius: '8px', 
                padding: '1rem',
                background: 'var(--gray-800)'
              }}
            >
              <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{doc.file_name}</strong>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>Similarity: {doc.similarity}</span>
              </header>
              <p style={{ 
                whiteSpace: 'pre-wrap', 
                color: 'var(--gray-300)', 
                fontSize: '0.8125rem',
                lineHeight: '1.5'
              }}>
                {doc.content}
              </p>
            </article>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="secondary" onClick={() => handleExport('csv')}>
          Export CSV
        </button>
        <button className="secondary" onClick={() => handleExport('json')}>
          Export JSON
        </button>
      </div>
    </div>
  );
};

const convertToCsv = (rows) => {
  if (!rows?.length) return '';
  const header = Object.keys(rows[0]);
  const body = rows.map((row) => header.map((key) => JSON.stringify(row[key] ?? '')).join(','));
  return [header.join(','), ...body].join('\n');
};

export default ResultsView;
