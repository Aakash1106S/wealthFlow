import { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function ResetPasswordPage() {
  const { resetPassword } = useContext(AuthContext);
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.password || form.password.length < 6) {
      errs.password = 'Minimum 6 characters required';
    }
    if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError('');
    
    const result = await resetPassword(token, form.password);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setApiError(result.error);
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined }));
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
              <h1 className="auth-title">New Password</h1>
              <p className="auth-subtitle">Please enter your new premium secure password.</p>
            </div>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle2 size={48} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Password Reset Successful!</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Your password has been successfully updated. Redirecting you to login in a few seconds...
              </p>
              <Link to="/login" style={{
                display: 'inline-flex',
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600,
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                Go to Login Now
              </Link>
            </div>
          ) : (
            <>
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
                  <label className="wf-label" htmlFor="reset-password">
                    <Lock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      className="wf-input"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                      autoComplete="new-password"
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

                <div>
                  <label className="wf-label" htmlFor="reset-confirm">
                    <Lock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Confirm New Password
                  </label>
                  <input
                    id="reset-confirm"
                    type="password"
                    className="wf-input"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={set('confirm')}
                    autoComplete="new-password"
                  />
                  {errors.confirm && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.confirm}</p>}
                </div>

                <Button type="submit" size="lg" className="w-full" loading={loading} style={{ marginTop: 8 }}>
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
