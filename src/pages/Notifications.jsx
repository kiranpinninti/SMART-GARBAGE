import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { useBins } from '../contexts/BinContext';

export default function Notifications() {
  const { alerts } = useBins();
  const [, setTick] = useState(0);

  // Force re-render every 2 seconds to update 'time ago' displays
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 30) return 'Just now';
    if (seconds < 60) return '1 minute ago';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes <= 5) return `${minutes} minutes ago`;
    
    return 'Few minutes ago';
  };

  const getStyle = (type) => {
    switch(type) {
      case 'critical': 
        return { 
          border: '1px solid rgba(255, 0, 85, 0.4)', 
          iconColor: 'var(--neon-red)',
          glow: '0 0 15px rgba(255, 0, 85, 0.15)',
          Icon: AlertTriangle
        };
      case 'warning': 
        return { 
          border: '1px solid rgba(242, 255, 0, 0.4)', 
          iconColor: 'var(--neon-yellow)',
          glow: '0 0 15px rgba(242, 255, 0, 0.1)',
          Icon: Info
        };
      case 'info': 
        return { 
          border: '1px solid rgba(0, 243, 255, 0.4)', 
          iconColor: 'var(--neon-blue)',
          glow: 'none',
          Icon: Info
        };
      default: 
        return { border: 'none', iconColor: 'white', glow: 'none', Icon: Info };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="title-glow">Alerts Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Automated System Notifications</p>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map((alert) => {
          const style = getStyle(alert.type);
          const IconComponent = style.Icon;

          return (
            <div 
              key={alert.id} 
              className="glass-card p-4"
              style={{ borderLeft: `4px solid ${style.iconColor}`, boxShadow: style.glow }}
            >
              <div className="flex items-start gap-3">
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <IconComponent color={style.iconColor} size={20} style={{ filter: `drop-shadow(0 0 5px ${style.iconColor})` }}/>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: alert.type === 'critical' ? 'var(--neon-red)' : 'var(--text-main)' }}>
                      {alert.title}
                    </h3>
                    <div className="flex items-center gap-1" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <Clock size={10} />
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
