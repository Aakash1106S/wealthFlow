import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Save, Lock, Settings, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { useTheme } from '../hooks/useTheme';
import { authAPI } from '../services/api';

export default function ProfilePage() {
  const { state, updateUser, logout } = useContext(AuthContext);
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  // Profile Edit Form State
  const [form, setForm] = useState({
    name: state.user?.name || '',
    currency: state.user?.currency || 'INR',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Change Form State
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwApiError, setPwApiError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const result = await updateUser({ name: form.name.trim(), currency: form.currency });
    setLoading(false);
    
    if (result.success) {
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Profile updated!', type: 'success' } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      dispatch({ type: 'ADD_TOAST', payload: { message: result.error || 'Failed to update', type: 'error' } });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwApiError('');
    setPwErrors({});
    
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Must be at least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errs).length) {
      setPwErrors(errs);
      return;
    }

    setPwLoading(true);
    try {
      const { data } = await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwLoading(false);
      
      if (data.success) {
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Password updated successfully!', type: 'success' } });
        setPwSaved(true);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPwSaved(false), 3000);
      }
    } catch (err) {
      setPwLoading(false);
      setPwApiError(err.response?.data?.message || 'Password update failed. Check old password.');
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Password change failed', type: 'error' } });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 py-5 md:px-6 lg:px-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-3xl font-bold text-emerald-400 shrink-0">
          {state.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{state.user?.name}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{state.user?.email}</p>
        </div>
      </motion.div>

      {/* Main Grid: Dual columns on desktop, single on tablet/mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Edit Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card hover={false}>
              <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] mb-5">
                <User size={16} className="text-emerald-400 shrink-0" /> Personal Information
              </h3>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  prefix={<User size={14} />}
                />
                <Input
                  label="Email Address"
                  value={state.user?.email || ''}
                  disabled
                  prefix={<Mail size={14} />}
                  className="opacity-50 cursor-not-allowed"
                />
                <Select
                  label="Currency"
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </Select>
                <Button type="submit" className="w-full mt-2 min-h-[40px] text-xs font-semibold" loading={loading}>
                  <Save size={16} />
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Theme Settings Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card hover={false}>
              <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] mb-4">
                <Settings size={16} className="text-emerald-400 shrink-0" /> Platform Preferences
              </h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)] gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-[var(--text-primary)] block">Visual Theme</span>
                  <span className="text-xs text-[var(--text-muted)] block truncate">Toggle between Dark and Light Mode</span>
                </div>
                <Button variant="secondary" size="sm" className="min-h-[32px] text-xs font-medium shrink-0" onClick={toggleTheme}>
                  {isDark ? <Sun size={14} className="text-yellow-400 shrink-0" /> : <Moon size={14} className="shrink-0" />}
                  <span className="ml-1.5 capitalize">{theme} Mode</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Change Password Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card hover={false}>
              <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] mb-5">
                <Lock size={16} className="text-emerald-400 shrink-0" /> Change Password
              </h3>
              
              {pwApiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {pwApiError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.currentPassword}
                  onChange={e => { setPwForm(f => ({ ...f, currentPassword: e.target.value })); setPwErrors(er => ({ ...er, currentPassword: undefined })); }}
                  error={pwErrors.currentPassword}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={pwForm.newPassword}
                  onChange={e => { setPwForm(f => ({ ...f, newPassword: e.target.value })); setPwErrors(er => ({ ...er, newPassword: undefined })); }}
                  error={pwErrors.newPassword}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.confirmPassword}
                  onChange={e => { setPwForm(f => ({ ...f, confirmPassword: e.target.value })); setPwErrors(er => ({ ...er, confirmPassword: undefined })); }}
                  error={pwErrors.confirmPassword}
                />
                <Button type="submit" className="w-full mt-2 min-h-[40px] text-xs font-semibold" loading={pwLoading}>
                  <Lock size={16} />
                  {pwSaved ? 'Password Changed!' : 'Change Password'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card hover={false}>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Account Info</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Member since</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">
                    {state.user?.createdAt 
                      ? new Date(state.user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) 
                      : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Currency</span>
                  <span className="text-sm text-[var(--accent)] font-medium">{form.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Data storage</span>
                  <span className="text-sm text-[var(--accent)] font-semibold">Cloud Sync (MERN + MongoDB Atlas)</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-red-500/10" hover={false}>
              <h3 className="text-base font-semibold text-red-400 mb-4">Danger Zone</h3>
              <Button
                variant="danger"
                className="w-full !bg-red-500/10 !border-red-500/20 !text-red-400 hover:!bg-red-500/20 min-h-[40px] text-xs font-semibold"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </Button>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
