import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await forgotPassword(email);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      if (result.resetUrl) {
        // In local development, show the link directly for testing ease!
        setDevResetUrl(result.resetUrl);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 500px 400px at 50% 30%, rgba(0,212,170,0.04), transparent)',
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
              <h1 className="auth-title">Reset Password</h1>
              <p className="auth-subtitle">We'll send you instructions to reset your password.</p>
            </div>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle2 size={48} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Check your inbox</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              </p>

              {devResetUrl && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(0,212,170,0.08)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  borderRadius: 10,
                  marginBottom: 20,
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Dev Mode Helper</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Click below to simulate opening the email reset link:</p>
                  <a 
                    href={devResetUrl} 
                    style={{ 
                      fontSize: 11, 
                      color: 'var(--text-primary)', 
                      fontWeight: 600, 
                      textDecoration: 'underline',
                      wordBreak: 'break-all'
                    }}
                  >
                    Open Password Reset Page
                  </a>
                </div>
              )}

              <Link to="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600
              }}>
                <ArrowLeft size={12} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  background: 'rgba(255,71,87,0.08)',
                  border: '1px solid rgba(255,71,87,0.2)',
                  borderRadius: 8,
                  color: 'var(--red)',
                  fontSize: 12,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="wf-label" htmlFor="forgot-email">
                    <Mail size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="wf-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
