import { MapPin, Battery, Wifi } from 'lucide-react';
import { useBins } from '../contexts/BinContext';

export default function BinMonitoring() {
  const { bins } = useBins();

  const getColorClass = (level) => {
    if (level <= 50) return { bg: 'var(--neon-green)', text: 'var(--neon-green)', badge: 'empty' };
    if (level <= 80) return { bg: 'var(--neon-yellow)', text: 'var(--neon-yellow)', badge: 'medium' };
    return { bg: 'var(--neon-red)', text: 'var(--neon-red)', badge: 'full' };
  };

  const getStatusText = (level) => {
    if (level <= 50) return 'Normal';
    if (level <= 80) return 'Warning';
    return 'Critical';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="title-glow">Smart Bin Status</h1>
        <p style={{ color: 'var(--text-muted)' }}>Detailed telemetry from all nodes</p>
      </div>

      <div className="flex flex-col gap-4">
        {bins.map((bin) => {
          const colors = getColorClass(bin.level);
          
          return (
            <div key={bin.id} className="glass-card p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{bin.name}</h3>
                  <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <MapPin size={12} />
                    <span>{bin.location}</span>
                  </div>
                </div>
                <span className={`status-badge ${colors.badge}`}>
                  {getStatusText(bin.level)}
                </span>
              </div>
              
              <div className="flex gap-4 mb-4 mt-2">
                <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Battery size={14} color={bin.battery < 30 ? 'var(--neon-red)' : 'var(--neon-green)'} />
                  <span>{bin.battery}%</span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Wifi size={14} color="var(--neon-blue)" />
                  <span>{bin.signal}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '0.85rem' }}>Fill Level</span>
                <span style={{ color: colors.text, fontWeight: 'bold' }}>{bin.level}%</span>
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${bin.level}%`, 
                    background: colors.bg,
                    boxShadow: `0 0 10px ${colors.bg}` 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
