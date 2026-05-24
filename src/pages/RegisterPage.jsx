import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, Mail, Lock, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', currency: 'INR' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password || form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    await new Promise(r => setTimeout(r, 600));
    const result = await register(form.name, form.email, form.password, form.currency);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setApiError(result.error);
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined }));
  };

  return (
    <div className="auth-page">
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 500px 350px at 50% 30%, rgba(0,212,170,0.04), transparent)',
      }} />
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
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Wallet size={22} color="#000" />
            </div>
            <div>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join WealthFlow and take control of your finances.</p>
            </div>
          </div>

          {apiError && (
            <div style={{
              marginBottom: 14, padding: '10px 14px',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 8, color: 'var(--red)', fontSize: 12,
            }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              id="register-name"
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              prefix={<User size={11} />}
            />
            <Input
              id="register-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              prefix={<Mail size={11} />}
            />
            <Input
              id="register-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              prefix={<Lock size={11} />}
              suffix={
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              }
            />
            <Input
              id="register-confirm"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              prefix={<Lock size={11} />}
            />
            <Select label="Currency" value={form.currency} onChange={set('currency')}>
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </Select>
            <Button type="submit" size="lg" className="w-full" loading={loading} style={{ marginTop: 4 }}>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
