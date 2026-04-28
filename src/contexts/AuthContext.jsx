import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock Auth Context without actual Firebase dependency in order to run securely offline.
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use localStorage to maintain session dynamically across browser reloads
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mockSessionUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn("Could not read local storage.");
    }
    setLoading(false);
  }, []);

  function signup(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) return reject({ code: 'auth/invalid-credential', message: 'Invalid credentials' });
        
        // Mock checking if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        if (existingUsers.find(u => u.email === email)) {
          return reject({ code: 'auth/email-already-in-use', message: 'Email already in use.' });
        }
        
        const newUser = { email, uid: Date.now().toString() };
        existingUsers.push({ email, password, uid: newUser.uid });
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
        
        // Auto login on successful signup
        setCurrentUser(newUser);
        localStorage.setItem('mockSessionUser', JSON.stringify(newUser));
        resolve({ user: newUser });
      }, 700); // Simulate network latency
    });
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = existingUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          const sessionUser = { email: user.email, uid: user.uid };
          setCurrentUser(sessionUser);
          localStorage.setItem('mockSessionUser', JSON.stringify(sessionUser));
          resolve({ user: sessionUser });
        } else {
          // Determine specifics of error
          const userExists = existingUsers.find(u => u.email === email);
          if (userExists) {
             reject({ code: 'auth/wrong-password', message: 'Invalid password.' });
          } else {
             reject({ code: 'auth/user-not-found', message: 'User identity not discovered.' });
          }
        }
      }, 700); // Simulate network latency
    });
  }

  function logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        localStorage.removeItem('mockSessionUser');
        resolve();
      }, 400);
    });
  }

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
