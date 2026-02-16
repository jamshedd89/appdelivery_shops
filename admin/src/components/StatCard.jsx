import React from 'react';
export default function StatCard({ title, value, icon: Icon, color = '#4A90D9' }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: color + '15' }}><Icon size={24} color={color} /></div>
      <div><div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{value}</div><div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{title}</div></div>
    </div>
  );
}
