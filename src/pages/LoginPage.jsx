import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, Mail, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    await new Promise(r => setTimeout(r, 600));
    const result = await login(form.email, form.password, form.remember);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setApiError(result.error);
  };

  const set = (field) => (e) => {
    const val = field === 'remember' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    setErrors(er => ({ ...er, [field]: undefined }));
  };

  const demoLogin = async () => {
    setLoading(true);
    setApiError('');
    const registered = localStorage.getItem('registered_users');
    let users = [];
    try { users = JSON.parse(registered) || []; } catch {}
    if (!users.find(u => u.email === 'demo@wealthflow.app')) {
      users.push({ name: 'Demo User', email: 'demo@wealthflow.app', password: 'Demo@123', currency: 'INR', avatar: '' });
      localStorage.setItem('registered_users', JSON.stringify(users));
    }
    await new Promise(r => setTimeout(r, 400));
    const result = await login('demo@wealthflow.app', 'Demo@123');
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setApiError(result.error);
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 500px 400px at 50% 30%, rgba(0,212,170,0.04), transparent)',
      }} />
      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 380, position: 'relative' }}
      >
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Wallet size={22} color="#000" />
            </div>
            <div>
              <h1 className="auth-title">WealthFlow</h1>
              <p className="auth-subtitle">Master your money with clear insights.</p>
            </div>
          </div>

          {apiError && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: 'rgba(255,71,87,0.08)',
              border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 8,
              color: 'var(--red)',
              fontSize: 12,
            }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="wf-label" htmlFor="login-email">
                <Mail size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="wf-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div>
              <label className="wf-label" htmlFor="login-password">
                <Lock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="wf-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.password}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  id="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={set('remember')}
                  style={{ width: 13, height: 13, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <label htmlFor="remember" style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} style={{ marginTop: 4 }}>
              Sign In
            </Button>
          </form>

          <div style={{ position: 'relative', margin: '16px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid var(--border)' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: '0 10px', background: 'var(--bg-card)', fontSize: 10, color: 'var(--text-muted)' }}>or</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={demoLogin} size="lg">
            Try Demo Account
          </Button>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
