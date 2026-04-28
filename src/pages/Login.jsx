import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill out all fields.');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      if (isLogin) {
        await login(email, password);
        setSuccess('Login successful!');
        navigate('/dashboard');
      } else {
        await signup(email, password);
        setSuccess('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else {
        setError('Failed to authenticate. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-card p-8 floating" style={{ width: '100%', maxWidth: '400px' }}>
        
        <div className="flex flex-col items-center mb-10 gap-4">
          <div className="bg-blue" style={{ 
            padding: '16px', 
            borderRadius: '50%', 
            background: 'var(--glass-bg)',
            boxShadow: 'var(--glow-shadow)',
            border: '1px solid var(--neon-blue)',
            color: 'var(--neon-blue)'
          }}>
            <Trash2 size={40} />
          </div>
          <h2 className="title-glow mt-6 text-center" style={{ fontWeight: 'bold', letterSpacing: '4px', marginBottom: '10px' }}>SMART BIN</h2>

        </div>

        {error && (
          <div className="mb-4 p-3" style={{ background: 'rgba(255, 0, 85, 0.1)', border: '1px solid var(--neon-red)', borderRadius: '8px', color: 'var(--neon-red)', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3" style={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid var(--neon-green)', borderRadius: '8px', color: 'var(--neon-green)', textAlign: 'center', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input 
              type="email" 
              className="neon-input" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="neon-input" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button disabled={loading} type="submit" className="neon-button mt-4">
            {loading ? 'Processing...' : (isLogin ? 'Login sequence' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{ 
              background: 'none', border: 'none', color: 'var(--neon-blue)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' 
            }}
          >
            {isLogin ? "Need an account? Sign up" : "Already registered? Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}
