import React, { createContext, useContext, useState, useEffect } from 'react';

const BinContext = createContext();

export function useBins() {
  return useContext(BinContext);
}

const defaultBins = [
  { id: 1, name: 'Block A Entrance', location: 'North Wing', level: 25, status: 'Low', battery: 85, signal: 'Strong' },
  { id: 2, name: 'Canteen Area', location: 'Food Court', level: 60, status: 'Medium', battery: 92, signal: 'Medium' },
  { id: 3, name: 'Library', location: 'Quiet Zone', level: 40, status: 'Low', battery: 45, signal: 'Weak' },
  { id: 4, name: 'Sports Complex', location: 'Gym', level: 15, status: 'Low', battery: 98, signal: 'Strong' }
];

export function BinProvider({ children }) {
  const [bins, setBins] = useState(() => {
    const saved = localStorage.getItem('smartBins');
    return saved ? JSON.parse(saved) : defaultBins;
  });

  const [alerts, setAlerts] = useState(() => {
    const savedAlerts = localStorage.getItem('smartAlerts');
    const parsed = savedAlerts ? JSON.parse(savedAlerts) : [];
    // Migration: ensure all alerts have a timestamp property
    return parsed.map(alert => ({
      ...alert,
      timestamp: alert.timestamp || alert.id || Date.now()
    }));
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('smartBins', JSON.stringify(bins));
  }, [bins]);

  useEffect(() => {
    localStorage.setItem('smartAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = (type, title, message) => {
    const newAlert = {
      id: Date.now(),
      timestamp: Date.now(),
      type,
      title,
      message,
      time: 'Just now'
    };
    
    setAlerts(prev => {
      // Avoid duplicate identical alerts within 1 minute
      const alreadyWarned = prev.find(a => a.title === title && (Date.now() - a.timestamp) < 60000);
      if (alreadyWarned) return prev;
      return [newAlert, ...prev].slice(0, 50); // Keep max 50 alerts
    });
  };

  // Sensor Simulation Loop
  useEffect(() => {
    // Generate random 5-10 seconds interval
    const getRandomInterval = () => Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

    let timeoutId;
    
    const simulateSensors = () => {
      setBins(currentBins => {
        return currentBins.map(bin => {
          // Identify random simulation chance. We won't update *every* bin every tick to be realistic
          if (Math.random() > 0.6) {
            let newLevel = bin.level;
            
            // Check for garbage collection (reset)
            if (bin.level >= 80) {
              if (Math.random() > 0.7) { // 30% chance per tick once full
                addAlert('info', 'Bin Cleaned', `The bin at ${bin.location} has been cleared and is ready for use.`);
                return { ...bin, level: 0, status: 'Low' };
              }
            }

            // Increase by 5-15%
            const increment = Math.floor(Math.random() * 11) + 5;
            newLevel = Math.min(100, newLevel + increment);
            
            // Update Status mappings
            let newStatus = 'Low';
            if (newLevel >= 80) newStatus = 'Full';
            else if (newLevel >= 50) newStatus = 'Medium';
            
            const updatedBin = { ...bin, level: newLevel, status: newStatus };

            // Notification Trigger
            if (newLevel >= 80 && bin.level < 80) {
              addAlert('critical', 'Bin is Full', `The bin at ${bin.location} has reached critical capacity (${newLevel}%).`);
            }

            return updatedBin;
          }
          return bin;
        });
      });
      
      timeoutId = setTimeout(simulateSensors, getRandomInterval());
    };

    timeoutId = setTimeout(simulateSensors, getRandomInterval());
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only mount once

  const addBin = (newBinData) => {
    const newBin = {
      id: Date.now(),
      level: 0,
      status: 'Low',
      battery: 100,
      signal: 'Strong',
      ...newBinData
    };
    setBins([...bins, newBin]);
  };

  const deleteBin = (id) => {
    setBins(bins.filter(b => b.id !== id));
  };

  return (
    <BinContext.Provider value={{ bins, alerts, addBin, deleteBin }}>
      {children}
    </BinContext.Provider>
  );
}
