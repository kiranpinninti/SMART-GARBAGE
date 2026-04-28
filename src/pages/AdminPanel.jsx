import { useState } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { useBins } from '../contexts/BinContext';

export default function AdminPanel() {
  const { bins, addBin, deleteBin } = useBins();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newBinName, setNewBinName] = useState('');
  const [newBinLocation, setNewBinLocation] = useState('');

  const handleAddBin = (e) => {
    e.preventDefault();
    if (!newBinName || !newBinLocation) return;
    
    addBin({
      name: newBinName,
      location: newBinLocation
    });
    
    setNewBinName('');
    setNewBinLocation('');
  };

  const handleDelete = (id) => {
    deleteBin(id);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Access denied.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-4" style={{ minHeight: '60vh' }}>
        <div className="glass-card p-6 floating" style={{ width: '100%', maxWidth: '350px' }}>
          <div className="flex flex-col items-center mb-6 gap-2">
            <div className="flex justify-center items-center" style={{ 
              width: '60px', height: '60px',
              borderRadius: '50%', background: 'rgba(0, 243, 255, 0.1)',
              boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)',
              border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)'
            }}>
              <Lock size={28} />
            </div>
            <h2 className="title-glow mt-4 text-center">Admin Login</h2>
            <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Secure Authorization System</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input 
                type="password" 
                className="neon-input" 
                placeholder="Enter Passcode" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={loginError ? { borderColor: 'var(--neon-red)' } : {}}
                required
              />
            </div>
            {loginError && <p style={{ color: 'var(--neon-red)', fontSize: '0.85rem', textAlign: 'center' }}>{loginError}</p>}
            <button type="submit" className="neon-button mt-2">
              Authorize Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="title-glow">Admin Console</h1>
        <p style={{ color: 'var(--text-muted)' }}>Node configuration & management</p>
      </div>

      {/* Add New Bin Form */}
      <div className="glass-card p-4">
        <h3 className="mb-4 text-green" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Register New Node
        </h3>
        <form onSubmit={handleAddBin} className="flex flex-col gap-3">
          <input 
            type="text" 
            className="neon-input" 
            placeholder="Node Designation (e.g. Block C)" 
            value={newBinName}
            onChange={(e) => setNewBinName(e.target.value)}
            required
          />
          <input 
            type="text" 
            className="neon-input" 
            placeholder="Physical Location" 
            value={newBinLocation}
            onChange={(e) => setNewBinLocation(e.target.value)}
            required
          />
          <button type="submit" className="neon-button mt-2" style={{ background: 'linear-gradient(135deg, var(--neon-green), #00ba4e)' }}>
            Deploy Node
          </button>
        </form>
      </div>

      {/* Existing Bins List */}
      <div>
        <h3 className="mb-4" style={{ color: 'var(--neon-blue)' }}>Active Nodes</h3>
        <div className="flex flex-col gap-3">
          {bins.map(bin => (
            <div key={bin.id} className="glass-card p-3 flex justify-between items-center" style={{ backdropFilter: 'blur(5px)' }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{bin.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bin.location}</p>
              </div>
              <button 
                onClick={() => handleDelete(bin.id)}
                style={{ 
                  background: 'rgba(255, 0, 85, 0.1)',
                  border: '1px solid rgba(255, 0, 85, 0.3)',
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'var(--neon-red)',
                  cursor: 'pointer',
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
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
