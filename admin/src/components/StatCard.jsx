import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = '#4A90D9' }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color + '15' }}
      >
        <Icon size={24} color={color} />
      </div>
      <div>
        <div className="text-[28px] font-bold text-dark">{value}</div>
        <div className="text-[13px] text-gray-500 font-medium">{title}</div>
      </div>
    </div>
  );
}
