import React, { useMemo, useState } from 'react';
import { useSchema, useSubmitQuery, useQueryHistory } from '../api/hooks';

const QueryPanel = ({ onResult }) => {
  const [query, setQuery] = useState('Show me all Python developers in Engineering');
  const { data: schema } = useSchema();
  const { data: history } = useQueryHistory();
  const { mutateAsync: submitQuery, isLoading } = useSubmitQuery();

  const suggestions = useMemo(() => {
    if (!schema?.vocabulary) return [];
    const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const last = tokens[tokens.length - 1];
    if (!last) return [];
    return schema.vocabulary
      .filter((word) => word.startsWith(last) && word !== last)
      .slice(0, 5);
  }, [query, schema]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    const response = await submitQuery({ query });
    onResult(response);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Query Engine</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask about employees, salaries, skills, reviews..."
          />
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              background: 'var(--gray-900)',
              borderRadius: '8px',
              border: '1px solid var(--gray-700)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              zIndex: 10
            }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onMouseDown={() => setQuery((current) => `${current} ${suggestion}`.trim())}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    cursor: 'pointer',
                    color: 'var(--gray-300)',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid var(--gray-800)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--gray-800)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing…' : 'Run Query'}
          </button>
          <select
            onChange={(event) => {
              if (!event.target.value) return;
              setQuery(event.target.value);
            }}
            value=""
          >
            <option value="">Recent queries…</option>
            {history?.map((item) => (
              <option key={item.timestamp} value={item.query}>
                {item.query_type.toUpperCase()} • {item.query}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;
