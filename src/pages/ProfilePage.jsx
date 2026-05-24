import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';

export default function ProfilePage() {
  const { state, updateUser, logout } = useContext(AuthContext);
  const { dispatch } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: state.user?.name || '',
    currency: state.user?.currency || 'INR',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    updateUser({ name: form.name.trim(), currency: form.currency });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Profile updated!', type: 'success' } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8 max-w-xl mx-auto">

      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-3xl font-bold text-emerald-400">
          {state.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{state.user?.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{state.user?.email}</p>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <Card hover={false}>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
            <User size={18} className="text-emerald-400" /> Personal Information
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
            <Button type="submit" className="w-full mt-2">
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <Card hover={false}>
          <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Member since</span>
              <span className="text-sm text-white">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Currency</span>
              <span className="text-sm text-emerald-400 font-medium">{form.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Data storage</span>
              <span className="text-sm text-gray-300">Local device only</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-red-500/10" hover={false}>
          <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
          <Button
            variant="danger"
            className="w-full !bg-red-500/10 !border-red-500/20 !text-red-400 hover:!bg-red-500/20"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign Out
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
