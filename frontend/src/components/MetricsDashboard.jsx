import React, { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQueryHistory, useSchema } from '../api/hooks';

const MetricsDashboard = ({ latestResult }) => {
  const { data: history } = useQueryHistory();
  const { data: schema } = useSchema();

  const chartData = useMemo(() => {
    if (!history) return [];
    return history.slice(0, 15).reverse().map((item) => ({
      name: new Date(item.timestamp * 1000).toLocaleTimeString(),
      duration: item.performance?.elapsed_seconds ?? 0,
      type: item.query_type
    }));
  }, [history]);

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">Metrics Dashboard</h3>
      </div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <Metric title="Tables" value={schema ? Object.keys(schema.tables).length : '—'} subtitle="Discovered" />
        <Metric title="Relationships" value={schema?.relationships?.length ?? '—'} subtitle="Foreign Keys" />
        <Metric title="Cache" value={latestResult?.performance?.cache_hit ? 'Hit' : 'Miss'} subtitle="Last query" />
        <Metric title="Documents" value={latestResult?.document_results?.length ?? '—'} subtitle="Last query" />
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis hide domain={[0, 'dataMax + 1']} />
            <Tooltip 
              formatter={(value, name, props) => [`${value}s`, props.payload.type]}
              contentStyle={{ 
                background: 'var(--gray-900)', 
                border: '1px solid var(--gray-700)',
                borderRadius: '6px',
                color: 'var(--white)'
              }}
            />
            <Area type="monotone" dataKey="duration" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorDuration)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Metric = ({ title, value, subtitle }) => (
  <div style={{ 
    padding: '1rem', 
    borderRadius: '8px', 
    background: 'var(--gray-800)',
    border: '1px solid var(--gray-700)'
  }}>
    <p style={{ 
      margin: 0, 
      color: 'var(--gray-400)', 
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {title}
    </p>
    <p style={{ 
      margin: '0.5rem 0 0.25rem', 
      fontSize: '1.75rem', 
      fontWeight: 700,
      color: 'var(--white)'
    }}>
      {value}
    </p>
    <p style={{ 
      margin: 0, 
      color: 'var(--gray-500)',
      fontSize: '0.75rem'
    }}>
      {subtitle}
    </p>
  </div>
);

export default MetricsDashboard;
