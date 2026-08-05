import React, { createContext, useContext, useState, useEffect } from 'react';

const BinContext = createContext();

export function useBins() {
  return useContext(BinContext);
}

const defaultBins = [
  { id: 1, name: 'Main Entrance', block: 'Main Block', floor: 'Ground Floor', location: 'Gate 1', level: 25, status: 'Low', battery: 85, signal: 'Strong', lat: 17.4455, lng: 78.3499, lastUpdated: Date.now() },
  { id: 2, name: 'Admin Office', block: 'Main Block', floor: '1st Floor', location: 'Corridor A', level: 60, status: 'Medium', battery: 92, signal: 'Medium', lat: 17.4458, lng: 78.3495, lastUpdated: Date.now() },
  { id: 3, name: 'Labs Wing', block: 'CSE Block', floor: '2nd Floor', location: 'Lab 204', level: 40, status: 'Low', battery: 45, signal: 'Weak', lat: 17.4465, lng: 78.3485, lastUpdated: Date.now() },
  { id: 4, name: 'Staff Room', block: 'CSE Block', floor: '1st Floor', location: 'Hallway', level: 85, status: 'Full', battery: 90, signal: 'Strong', lat: 17.4467, lng: 78.3482, lastUpdated: Date.now() },
  { id: 5, name: 'Workshop A', block: 'Mech Block', floor: 'Ground Floor', location: 'Heavy Machinery', level: 15, status: 'Low', battery: 98, signal: 'Strong', lat: 17.4440, lng: 78.3510, lastUpdated: Date.now() },
  { id: 6, name: 'Reading Room', block: 'Library', floor: '2nd Floor', location: 'Quiet Zone', level: 75, status: 'Medium', battery: 60, signal: 'Strong', lat: 17.4450, lng: 78.3480, lastUpdated: Date.now() },
  { id: 7, name: 'Stadium Entrance', block: 'Playground', floor: 'Outdoors', location: 'Gate A', level: 30, status: 'Low', battery: 80, signal: 'Medium', lat: 17.4435, lng: 78.3470, lastUpdated: Date.now() },
  { id: 8, name: 'Main Dining', block: 'Canteen', floor: 'Ground Floor', location: 'Food Court', level: 50, status: 'Medium', battery: 88, signal: 'Strong', lat: 17.4460, lng: 78.3505, lastUpdated: Date.now() }
];

export function BinProvider({ children }) {
  const [bins, setBins] = useState(() => {
    const saved = localStorage.getItem('smartBins');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if the old structure exists without blocks, override with defaultBins
      if (parsed.length > 0 && !parsed[0].block) {
        return defaultBins;
      }
      return parsed;
    }
    return defaultBins;
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
                return { ...bin, level: 0, status: 'Low', lastUpdated: Date.now() };
              }
            }

            // Increase by 5-15%
            const increment = Math.floor(Math.random() * 11) + 5;
            newLevel = Math.min(100, newLevel + increment);
            
            // Update Status mappings
            let newStatus = 'Low';
            if (newLevel >= 80) newStatus = 'Full';
            else if (newLevel >= 50) newStatus = 'Medium';
            
            const updatedBin = { ...bin, level: newLevel, status: newStatus, lastUpdated: Date.now() };

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
