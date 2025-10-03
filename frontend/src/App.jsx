import React, { useState, useEffect } from 'react';
import DatabaseConnector from './components/DatabaseConnector.jsx';
import DocumentUploader from './components/DocumentUploader.jsx';
import QueryPanel from './components/QueryPanel.jsx';
import ResultsView from './components/ResultsView.jsx';
import MetricsDashboard from './components/MetricsDashboard.jsx';

function App() {
  const [latestResult, setLatestResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('chat'); // chat, database, documents, analytics, docs, api
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined' && window.gsap) {
      const gsap = window.gsap;
      
      gsap.from('.main-chat-area', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">INFERA</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-content">
            <div className="sidebar-section">
              <h3 className="sidebar-section-title">Workspace</h3>
              <button 
                className={`sidebar-item ${activeView === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveView('chat')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Query Chat</span>
              </button>
              
              <button 
                className={`sidebar-item ${activeView === 'database' ? 'active' : ''}`}
                onClick={() => setActiveView('database')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
                <span>Database</span>
              </button>

              <button 
                className={`sidebar-item ${activeView === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveView('documents')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                <span>Documents</span>
              </button>

              <button 
                className={`sidebar-item ${activeView === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveView('analytics')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
                <span>Analytics</span>
              </button>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-section-title">Resources</h3>
              <button 
                className={`sidebar-item ${activeView === 'docs' ? 'active' : ''}`}
                onClick={() => setActiveView('docs')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>Documentation</span>
              </button>
              
              <button 
                className={`sidebar-item ${activeView === 'api' ? 'active' : ''}`}
                onClick={() => setActiveView('api')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span>API Reference</span>
              </button>
            </div>

            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="user-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="user-info">
                  <div className="user-name">Harsh Prajapati</div>
                  <div className="user-role">Developer</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeView === 'chat' && 'Natural Language Query'}
              {activeView === 'database' && 'Database Connection'}
              {activeView === 'documents' && 'Document Management'}
              {activeView === 'analytics' && 'Analytics Dashboard'}
              {activeView === 'docs' && 'Documentation'}
              {activeView === 'api' && 'API Reference'}
            </h1>
          </div>
          <div className="header-right">
            <div className="menu-container">
              <button className="icon-button" onClick={() => setMenuOpen(!menuOpen)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              
              {menuOpen && (
                <div className="dropdown-menu">
                  <button className="menu-item" onClick={() => { window.location.reload(); setMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                    </svg>
                    <span>Refresh Page</span>
                  </button>
                  
                  <button className="menu-item" onClick={() => { localStorage.clear(); alert('Cache cleared!'); setMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Clear Cache</span>
                  </button>
                  
                  <div className="menu-divider"></div>
                  
                  <button className="menu-item" onClick={() => { setActiveView('docs'); setMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>View Documentation</span>
                  </button>
                  
                  <button className="menu-item" onClick={() => { setActiveView('api'); setMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span>API Reference</span>
                  </button>
                  
                  <div className="menu-divider"></div>
                  
                  <button className="menu-item" onClick={() => { window.open('https://github.com', '_blank'); setMenuOpen(false); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <span>About INFERA</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="content-area">
          {activeView === 'chat' && (
            <div className="chat-interface">
              <div className="chat-messages">
                <div className="welcome-message">
                  <div className="welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h2>Ask questions about your data</h2>
                  <p>Type a natural language query to search your database or upload documents for context-aware search.</p>
                  
                  <div className="example-queries">
                    <div className="example-query">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      Show me all employees in the sales department
                    </div>
                    <div className="example-query">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      What is the average salary by department?
                    </div>
                    <div className="example-query">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      List employees hired in the last 6 months
                    </div>
                  </div>
                </div>

                {latestResult && (
                  <div className="result-container">
                    <ResultsView result={latestResult} />
                  </div>
                )}
              </div>

              <div className="chat-input-area">
                <QueryPanel onResult={setLatestResult} />
              </div>
            </div>
          )}

          {activeView === 'database' && (
            <div className="tool-interface">
              <div className="tool-description">
                <h3>Database Connection</h3>
                <p>Connect to your SQL database to enable natural language queries</p>
              </div>
              <DatabaseConnector />
            </div>
          )}

          {activeView === 'documents' && (
            <div className="tool-interface">
              <div className="tool-description">
                <h3>Document Processing</h3>
                <p>Upload documents to enrich your database with semantic search capabilities</p>
              </div>
              <DocumentUploader />
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="tool-interface">
              <div className="tool-description">
                <h3>Performance Analytics</h3>
                <p>Monitor query performance and system metrics</p>
              </div>
              <MetricsDashboard latestResult={latestResult} />
            </div>
          )}

          {activeView === 'docs' && (
            <div className="tool-interface">
              <div className="docs-content">
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--white)' }}>Documentation</h2>
                <p style={{ fontSize: '1rem', color: 'var(--gray-300)', marginBottom: '2rem' }}>
                  Learn how to use INFERA's AI-powered query engine to interact with your data using natural language.
                </p>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <h3 className="card-title">Quick Start</h3>
                  </div>
                  <ol style={{ color: 'var(--gray-300)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li><strong style={{ color: 'var(--white)' }}>Connect Database:</strong> Navigate to the Database section and connect your SQL database using a connection string.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Upload Documents (Optional):</strong> Go to Documents section to upload PDFs, TXT, CSV, or DOCX files for semantic search.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Ask Questions:</strong> Use the Query Chat to ask questions in plain English about your data.</li>
                    <li><strong style={{ color: 'var(--white)' }}>View Results:</strong> Get structured data and relevant document excerpts instantly.</li>
                  </ol>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <h3 className="card-title">Features</h3>
                  </div>
                  <ul style={{ color: 'var(--gray-300)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li><strong style={{ color: 'var(--white)' }}>Natural Language Processing:</strong> Ask questions in plain English without knowing SQL.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Schema Discovery:</strong> Automatically analyzes your database structure and relationships.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Document Intelligence:</strong> Upload and search documents using semantic understanding.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Hybrid Search:</strong> Combines structured database queries with document search.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Smart Caching:</strong> Speeds up repeated queries with intelligent caching.</li>
                    <li><strong style={{ color: 'var(--white)' }}>Export Options:</strong> Download results as CSV or JSON for further analysis.</li>
                  </ul>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                    <h3 className="card-title">Supported Databases</h3>
                  </div>
                  <ul style={{ color: 'var(--gray-300)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li>PostgreSQL</li>
                    <li>MySQL</li>
                    <li>SQLite</li>
                    <li>Microsoft SQL Server</li>
                    <li>Any SQLAlchemy-compatible database</li>
                  </ul>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    <h3 className="card-title">Supported Document Formats</h3>
                  </div>
                  <ul style={{ color: 'var(--gray-300)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li>PDF (.pdf)</li>
                    <li>Plain Text (.txt)</li>
                    <li>CSV (.csv)</li>
                    <li>Microsoft Word (.docx)</li>
                  </ul>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <h3 className="card-title">Example Queries</h3>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', fontSize: '0.875rem' }}>
                      "Show me all employees in the engineering department"
                    </code>
                    <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', fontSize: '0.875rem' }}>
                      "What is the average salary by department?"
                    </code>
                    <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', fontSize: '0.875rem' }}>
                      "List employees hired in the last 6 months"
                    </code>
                    <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', fontSize: '0.875rem' }}>
                      "Find resumes mentioning Python and machine learning"
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'api' && (
            <div className="tool-interface">
              <div className="docs-content">
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--white)' }}>API Reference</h2>
                <p style={{ fontSize: '1rem', color: 'var(--gray-300)', marginBottom: '2rem' }}>
                  Complete REST API documentation for integrating INFERA into your applications.
                </p>

                <div className="dashboard-card">
                  <div className="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--white)' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <h3 className="card-title">Base URL</h3>
                  </div>
                  <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', display: 'block', fontSize: '0.875rem' }}>
                    http://localhost:8000/api
                  </code>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--white)', color: 'var(--black)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>POST</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/connect</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Connect to a database using a connection string.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Request Body:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "connection_string": "postgresql://user:pass@host:5432/db"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "message": "Connected successfully",
  "tables": 5
}`}
                    </pre>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--gray-700)', color: 'var(--white)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>GET</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/schema</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Retrieve the discovered database schema with tables, columns, and relationships.
                  </p>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "tables": {
    "employees": {
      "columns": [
        {"name": "id", "type": "INTEGER"},
        {"name": "name", "type": "VARCHAR"}
      ]
    }
  },
  "relationships": [...],
  "vocabulary": ["employee", "salary", ...]
}`}
                    </pre>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--white)', color: 'var(--black)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>POST</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/ingest</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Upload and process documents for semantic search (multipart/form-data).
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Request:</h4>
                    <code style={{ background: 'var(--gray-800)', padding: '0.75rem', borderRadius: '6px', color: 'var(--white)', display: 'block', fontSize: '0.8125rem' }}>
                      files: File[] (PDF, TXT, CSV, DOCX)
                    </code>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "job_id": "abc-123",
  "message": "Processing started"
}`}
                    </pre>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--gray-700)', color: 'var(--white)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>GET</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/ingest/status/:job_id</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Check the status of document processing job.
                  </p>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "status": "completed",
  "processed_files": 3,
  "total_files": 3,
  "errors": []
}`}
                    </pre>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--white)', color: 'var(--black)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>POST</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/query</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Execute a natural language query against your database and documents.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Request Body:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "query": "Show me all employees in sales"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`{
  "query_type": "database",
  "table_results": [
    {"id": 1, "name": "John", "dept": "Sales"}
  ],
  "document_results": [],
  "performance": {
    "elapsed_seconds": 0.25,
    "cache_hit": false
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <span className="status-badge" style={{ background: 'var(--gray-700)', color: 'var(--white)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>GET</span>
                    <h3 className="card-title" style={{ marginLeft: '0.75rem' }}>/query/history</h3>
                  </div>
                  <p style={{ color: 'var(--gray-300)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Retrieve recent query history with performance metrics.
                  </p>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Response:</h4>
                    <pre style={{ background: 'var(--gray-800)', padding: '1rem', borderRadius: '6px', color: 'var(--gray-200)', fontSize: '0.8125rem', overflowX: 'auto' }}>
{`[
  {
    "query": "Show me all employees",
    "query_type": "database",
    "timestamp": 1696348800,
    "performance": {"elapsed_seconds": 0.15}
  }
]`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
