import { useMemo } from 'react';
import { MapPin, Battery, Wifi, Building, Activity } from 'lucide-react';
import { useBins } from '../contexts/BinContext';

export default function BinMonitoring() {
  const { bins } = useBins();

  const getColorClass = (level) => {
    if (level >= 80) return { bg: 'var(--neon-red)', text: 'var(--neon-red)', badge: 'full' };
    if (level >= 50) return { bg: 'var(--neon-yellow)', text: 'var(--neon-yellow)', badge: 'medium' };
    return { bg: 'var(--neon-green)', text: 'var(--neon-green)', badge: 'empty' };
  };

  const getStatusText = (level) => {
    if (level >= 80) return 'Critical';
    if (level >= 50) return 'Warning';
    return 'Normal';
  };

  const groupedBins = useMemo(() => {
    const grouped = {};
    bins.forEach(bin => {
      const blockName = bin.block || 'Unknown Block';
      if (!grouped[blockName]) grouped[blockName] = [];
      grouped[blockName].push(bin);
    });
    return grouped;
  }, [bins]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="title-glow flex items-center gap-2" style={{ fontSize: '1.7rem' }}>
          <Activity size={28} /> Bins Status
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Detailed Status of Each Bin</p>
      </div>

      <div className="flex flex-col gap-10">
        {Object.entries(groupedBins).map(([blockName, blockBins]) => (
          <div key={blockName} className="glass-card p-5" style={{ background: 'rgba(5, 5, 15, 0.4)' }}>
            <h2 className="flex items-center gap-2 mb-6" style={{ color: 'var(--neon-blue)', fontSize: '1.3rem', textShadow: '0 0 10px rgba(0,243,255,0.5)', borderBottom: '1px solid rgba(0,243,255,0.2)', paddingBottom: '10px' }}>
              <Building size={24} color="var(--neon-blue)" /> {blockName}
            </h2>
            
            <div className="flex flex-col gap-6">
              {blockBins.map((bin, index) => {
                const colors = getColorClass(bin.level);
                
                return (
                  <div 
                    key={bin.id} 
                    className={`glass-card p-5 ${index % 2 === 0 ? 'floating' : 'floating-delayed'}`}
                    style={{ 
                      border: `1px solid ${colors.bg}40`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                      e.currentTarget.style.boxShadow = `0 10px 25px ${colors.bg}20, inset 0 0 15px ${colors.bg}10`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 style={{ fontSize: '1.3rem', color: 'white', textShadow: '0 0 5px rgba(255,255,255,0.5)' }}>{bin.name}</h3>
                        <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="var(--neon-blue)" />
                          <span>{bin.floor} - {bin.location}</span>
                        </div>
                      </div>
                      <span className={`status-badge ${colors.badge}`} style={{ padding: '6px 12px', fontSize: '0.75rem', letterSpacing: '1px', boxShadow: `0 0 10px ${colors.bg}40` }}>
                        {getStatusText(bin.level).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex gap-6 mb-5 mt-2 bg-black bg-opacity-30 p-3 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Battery size={16} color={bin.battery < 30 ? 'var(--neon-red)' : 'var(--neon-green)'} style={{ filter: `drop-shadow(0 0 5px ${bin.battery < 30 ? 'var(--neon-red)' : 'var(--neon-green)'})` }} />
                        <span>{bin.battery}% Power</span>
                      </div>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Wifi size={16} color="var(--neon-blue)" style={{ filter: 'drop-shadow(0 0 5px var(--neon-blue))' }} />
                        <span>{bin.signal} Signal</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Capacity</span>
                      <span style={{ color: colors.text, fontWeight: 'bold', fontSize: '1.2rem', textShadow: `0 0 10px ${colors.text}` }}>{bin.level}%</span>
                    </div>
                    <div className="progress-container" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${bin.level}%`, 
                          background: colors.bg,
                          boxShadow: `0 0 15px ${colors.bg}, 0 0 5px ${colors.bg}` 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
