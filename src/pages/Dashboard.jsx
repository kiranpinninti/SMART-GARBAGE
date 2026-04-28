import { Activity, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBins } from '../contexts/BinContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const { bins } = useBins();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === 'Full').length;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Empty': return 'var(--neon-green)';
      case 'Medium': return 'var(--neon-yellow)';
      case 'Full': return 'var(--neon-red)';
      default: return 'white';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Empty': return 'empty';
      case 'Medium': return 'medium';
      case 'Full': return 'full';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col items-start text-left mt-2">
          <h1 className="title-glow" style={{ fontSize: '1.7rem', lineHeight: '1.3' }}>Smart Garbage Monitoring System</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Real-time Campus Metrics</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 0, 85, 0.1)',
            border: '1px solid var(--neon-red)',
            color: 'var(--neon-red)',
            padding: '8px 12px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--neon-red)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.boxShadow = '0 0 10px var(--neon-red)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.1)';
            e.currentTarget.style.color = 'var(--neon-red)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Session Quit</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-between gap-4">
        <div className="glass-card p-4 flex-col items-center" style={{ flex: 1, textAlign: 'center' }}>
          <Activity size={28} color="var(--neon-blue)" style={{ filter: 'drop-shadow(0 0 8px var(--neon-blue))' }} />
          <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{totalBins}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Nodes</span>
        </div>

        <div className="glass-card p-4 flex-col items-center" style={{ flex: 1, textAlign: 'center' }}>
          <AlertTriangle size={28} color="var(--neon-red)" style={{ filter: 'drop-shadow(0 0 8px var(--neon-red))' }} />
          <h2 style={{ fontSize: '2rem', margin: '10px 0', color: 'var(--neon-red)', textShadow: '0 0 10px var(--neon-red)' }}>
            {fullBins}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critical Load</span>
        </div>
      </div>

      <div>
        <h3 className="mb-4" style={{ color: 'var(--neon-blue)' }}>Live Node Status</h3>
        <div className="flex flex-col gap-4">
          {bins.map((bin, index) => (
            <div 
              key={bin.id} 
              className={`glass-card p-4 ${index % 2 === 0 ? 'floating' : 'floating-delayed'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 style={{ fontSize: '1.1rem' }}>{bin.name}</h3>
                <span className={`status-badge ${getStatusClass(bin.status)}`}>
                  {bin.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity Sensor</span>
                <span style={{ color: getStatusColor(bin.status) }}>{bin.level}%</span>
              </div>
              
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${bin.level}%`, 
                    background: getStatusColor(bin.status),
                    boxShadow: `0 0 10px ${getStatusColor(bin.status)}` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
