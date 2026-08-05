import { useState, useMemo } from 'react';
import { Activity, AlertTriangle, LogOut, Search, Map as MapIcon, ChevronDown, ChevronUp, MapPin, X, Building, Monitor, Settings, BookOpen, Trophy, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBins } from '../contexts/BinContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper component to center map when mapCenter state changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const { bins } = useBins();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.4455, 78.3499]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleViewOnMap = (e, bin) => {
    e.stopPropagation();
    setMapCenter([bin.lat, bin.lng]);
    setShowMap(true);
  };

  // Group bins by block
  const blockData = useMemo(() => {
    const grouped = {};
    bins.forEach(bin => {
      const blockName = bin.block || 'Unknown Block';
      if (!grouped[blockName]) {
        grouped[blockName] = { name: blockName, bins: [], totalLevel: 0, critical: false };
      }
      grouped[blockName].bins.push(bin);
      grouped[blockName].totalLevel += bin.level;
      if (bin.level >= 80) {
        grouped[blockName].critical = true;
      }
    });

    return Object.values(grouped).map(block => ({
      ...block,
      avgLevel: Math.round(block.totalLevel / block.bins.length)
    }));
  }, [bins]);

  const filteredBlocks = blockData.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBins = bins.length;
  const criticalBlocks = blockData.filter(b => b.critical).length;

  const getStatusColor = (level) => {
    if (level >= 80) return 'var(--neon-red)';
    if (level >= 50) return 'var(--neon-yellow)';
    return 'var(--neon-green)';
  };

  const getStatusLabel = (level) => {
    if (level >= 80) return 'Full';
    if (level >= 50) return 'Medium';
    return 'Low';
  };

  const getBlockIcon = (blockName) => {
    switch(blockName) {
      case 'Main Block': return <Building size={24} />;
      case 'CSE Block': return <Monitor size={24} />;
      case 'Mech Block': return <Settings size={24} />;
      case 'Library': return <BookOpen size={24} />;
      case 'Playground': return <Trophy size={24} />;
      case 'Canteen': return <Coffee size={24} />;
      default: return <Building size={24} />;
    }
  };

  const toggleBlock = (blockName) => {
    if (expandedBlock === blockName) setExpandedBlock(null);
    else setExpandedBlock(blockName);
  };

  const createCustomIcon = (level) => {
    let color = '#00ff66';
    let shadow = 'rgba(0, 255, 102, 0.5)';
    if (level >= 80) { color = '#ff0055'; shadow = 'rgba(255, 0, 85, 0.5)'; }
    else if (level >= 50) { color = '#f2ff00'; shadow = 'rgba(242, 255, 0, 0.5)'; }

    const html = `
      <div style="
        width: 14px; height: 14px; 
        background: ${color}; 
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 0 10px ${shadow}, 0 0 20px ${shadow};
      "></div>
    `;

    return L.divIcon({
      className: 'custom-neon-marker',
      html,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -10]
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col items-start text-left mt-2">
          <h1 className="title-glow" style={{ fontSize: '1.7rem', lineHeight: '1.3' }}>Smart Garbage Monitoring System</h1>
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
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Quit</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-between gap-4">
        <div className="glass-card p-4 flex-col items-center" style={{ flex: 1, textAlign: 'center' }}>
          <Activity size={28} color="var(--neon-blue)" style={{ filter: 'drop-shadow(0 0 8px var(--neon-blue))' }} />
          <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{totalBins}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Nodes</span>
        </div>

        <div className="glass-card p-4 flex-col items-center" style={{ flex: 1, textAlign: 'center', borderColor: criticalBlocks > 0 ? 'var(--neon-red)' : '' }}>
          <AlertTriangle size={28} color={criticalBlocks > 0 ? "var(--neon-red)" : "var(--neon-green)"} style={{ filter: `drop-shadow(0 0 8px ${criticalBlocks > 0 ? 'var(--neon-red)' : 'var(--neon-green)'})` }} />
          <h2 style={{ fontSize: '2rem', margin: '10px 0', color: criticalBlocks > 0 ? 'var(--neon-red)' : 'var(--neon-green)', textShadow: `0 0 10px ${criticalBlocks > 0 ? 'var(--neon-red)' : 'var(--neon-green)'}` }}>
            {criticalBlocks}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critical Blocks</span>
        </div>
      </div>

      {/* Tools Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2" style={{ transform: 'translateY(-50%)', color: 'var(--neon-blue)' }} />
          <input 
            type="text" 
            placeholder="Search blocks..." 
            className="neon-input"
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setMapCenter([17.4455, 78.3499]); setShowMap(true); }}
          className="glass-card"
          style={{ width: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--neon-blue)', cursor: 'pointer' }}
        >
          <MapIcon size={20} />
        </button>
      </div>

      {/* Building Cards List */}
      <div>
        <h3 className="mb-4" style={{ color: 'var(--neon-blue)' }}>Blocks Overview</h3>
        <div className="flex flex-col gap-4">
          {filteredBlocks.map((block, index) => {
            const isExpanded = expandedBlock === block.name;
            const avgColor = getStatusColor(block.avgLevel);
            const borderStyle = block.critical ? '1px solid var(--neon-red)' : '1px solid var(--glass-border)';
            const shadowStyle = block.critical ? '0 0 15px rgba(255, 0, 85, 0.2)' : 'var(--glass-shadow)';

            return (
              <div 
                key={block.name} 
                className={`glass-card p-4 ${index % 2 === 0 ? 'floating' : 'floating-delayed'}`}
                style={{ border: borderStyle, boxShadow: shadowStyle, cursor: 'pointer' }}
                onClick={() => toggleBlock(block.name)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 glass-card flex justify-center items-center" style={{ borderRadius: '50%', color: 'var(--neon-blue)', background: 'rgba(0, 243, 255, 0.05)' }}>
                    {getBlockIcon(block.name)}
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: '1.2rem', color: block.critical ? 'var(--neon-red)' : 'white' }}>{block.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: avgColor, 
                        boxShadow: `0 0 10px ${avgColor}` 
                      }}></span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {block.critical ? 'Critical Alerts Active' : 'Systems normal'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isExpanded ? <ChevronUp size={20} color="var(--neon-blue)" /> : <ChevronDown size={20} color="var(--neon-blue)" />}
                  </div>
                </div>

                {/* Expanded Details */}
                <div className={`block-details ${isExpanded ? 'expanded' : ''}`} onClick={e => e.stopPropagation()}>
                  <h4 className="mb-3 mt-5" style={{ fontSize: '0.9rem', color: 'var(--neon-blue)' }}>Interior Sensor Array</h4>
                  {block.bins.map(bin => {
                    const binColor = getStatusColor(bin.level);
                    return (
                      <div key={bin.id} className="floor-bin-item">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex flex-col">
                            <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{bin.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{bin.floor} - {bin.location}</span>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                              Updated: {bin.lastUpdated ? new Date(bin.lastUpdated).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => handleViewOnMap(e, bin)}
                                style={{ background: 'none', border: 'none', color: 'var(--neon-blue)', cursor: 'pointer' }}
                                title="View on Map"
                              >
                                <MapPin size={16} />
                              </button>
                              <span style={{ color: binColor, fontWeight: 'bold', fontSize: '1rem', textShadow: `0 0 8px ${binColor}` }}>{bin.level}%</span>
                            </div>
                            <span className={`status-badge ${getStatusLabel(bin.level) === 'Low' ? 'empty' : getStatusLabel(bin.level).toLowerCase()}`} style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                              {getStatusLabel(bin.level)}
                            </span>
                          </div>
                        </div>
                        <div className="progress-container" style={{ height: '4px', marginTop: '6px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ width: `${bin.level}%`, background: binColor, boxShadow: `0 0 5px ${binColor}` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Overlay Modal */}
      {showMap && (
        <div className="map-overlay">
          <div className="flex justify-between items-center mb-4">
            <h2 className="title-glow flex items-center gap-2"><MapPin size={24}/> Holographic Live Map</h2>
            <button onClick={() => setShowMap(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1100 }}>
              <X size={28} />
            </button>
          </div>
          
          <div className="map-container" style={{ borderRadius: '15px', overflow: 'hidden', flex: 1 }}>
            <MapContainer center={mapCenter} zoom={18} style={{ height: '100%', width: '100%', background: 'transparent' }}>
              <ChangeView center={mapCenter} zoom={18} />
              {/* Dark Cyperpunk Tile Theme using CartoDB Dark Matter */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {bins.map(bin => (
                <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={createCustomIcon(bin.level)}>
                  <Popup className="holographic-popup">
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--neon-blue)', fontSize: '1.1rem', textShadow: '0 0 5px var(--neon-blue)' }}>{bin.name}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bin.block} - {bin.floor}</p>
                      <div style={{ margin: '8px 0' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getStatusColor(bin.level), textShadow: `0 0 10px ${getStatusColor(bin.level)}` }}>{bin.level}%</span>
                      </div>
                      <p style={{ margin: '0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Status: <strong style={{ color: getStatusColor(bin.level) }}>{getStatusLabel(bin.level)}</strong>
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                        Live updated: {bin.lastUpdated ? new Date(bin.lastUpdated).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Routing aesthetics: connect all markers with glowing polylines */}
              <Polyline 
                positions={bins.map(b => [b.lat, b.lng])} 
                pathOptions={{ color: 'var(--neon-blue)', weight: 1, dashArray: '4 8', opacity: 0.3 }} 
              />
              {expandedBlock && (
                <Polyline 
                  positions={blockData.find(b => b.name === expandedBlock)?.bins.map(b => [b.lat, b.lng]) || []} 
                  pathOptions={{ color: 'var(--neon-green)', weight: 2, opacity: 0.6 }} 
                />
              )}
            </MapContainer>
          </div>
          
          <div className="glass-card mt-4 p-4 text-center">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time location triangulation active. Tracking {totalBins} nodes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
