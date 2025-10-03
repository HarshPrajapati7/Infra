import React, { useState } from 'react';
import { useConnectDatabase, useSchema } from '../api/hooks';

const DatabaseConnector = () => {
  const [connectionString, setConnectionString] = useState('sqlite+aiosqlite:///H:/ikam apps/project/data/company.db');
  const { mutateAsync: connect, isLoading } = useConnectDatabase();
  const { data: schema, error: schemaError } = useSchema();

  const handleConnect = async () => {
    await connect({ connection_string: connectionString });
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Database Connection</h3>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <label style={{ flex: 1 }}>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--gray-300)', fontSize: '0.875rem' }}>Connection String</span>
          <input
            type="text"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgresql://user:pass@host:5432/db"
          />
        </label>
        <button onClick={handleConnect} disabled={isLoading}>
          {isLoading ? 'Connecting…' : 'Connect & Analyze'}
        </button>
      </div>
      {schemaError && (
        <p style={{ color: 'var(--gray-400)', marginTop: '0.75rem', fontSize: '0.875rem' }}>Unable to load schema: {schemaError.message}</p>
      )}
      {schema && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--white)' }}>Discovered Schema</h4>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {Object.keys(schema.tables).length} tables • {schema.relationships.length} relationships
          </p>
          <div style={{ maxHeight: '220px', overflow: 'auto', border: '1px solid var(--gray-700)', borderRadius: '8px', padding: '1rem', background: 'var(--gray-800)' }}>
            {Object.entries(schema.tables).map(([table, details]) => (
              <div key={table} style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{table}</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, listStyle: 'disc', color: 'var(--gray-300)' }}>
                  {details.columns.map((column) => (
                    <li key={column.name} style={{ fontSize: '0.8125rem' }}>
                      {column.name} <small style={{ color: 'var(--gray-500)' }}>({column.type})</small>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseConnector;
