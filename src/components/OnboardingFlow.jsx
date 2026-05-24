import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, BarChart2, Target, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { AuthContext } from '../context/AuthContext';

const steps = [
  {
    icon: Wallet,
    title: 'Welcome to WealthFlow',
    description: 'Your all-in-one personal finance companion. Track expenses, monitor budgets, and reach your savings goals — all in one beautiful app.',
    color: '#00d4aa',
  },
  {
    icon: BarChart2,
    title: 'Powerful Analytics',
    description: 'Visualize your spending patterns with interactive charts. Understand where your money goes and make smarter decisions every month.',
    color: '#4a9eff',
  },
  {
    icon: Target,
    title: 'Set Your Currency',
    description: 'Choose your preferred currency to get started. You can always change this later in your settings.',
    color: '#9b59b6',
    isCurrencyStep: true,
  },
];

export function OnboardingFlow({ onFinish }) {
  const { updateUser } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState('INR');

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      updateUser({ currency });
      onFinish();
    }
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <motion.div
      className="onboarding-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 500px 400px at 50% 40%, ${current.color}08, transparent)`,
        transition: 'background 0.5s ease',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 40 }}>
          {steps.map((_, i) => (
            <motion.div
              key={i}
              style={{ height: 3, borderRadius: 99 }}
              animate={{
                width: i === step ? 28 : 6,
                backgroundColor: i <= step ? current.color : 'rgba(255,255,255,0.12)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            style={{ textAlign: 'center', marginBottom: 32 }}
          >
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: current.color + '18',
              border: `1px solid ${current.color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Icon size={28} style={{ color: current.color }} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>
              {current.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 320, margin: '0 auto 24px' }}>
              {current.description}
            </p>

            {current.isCurrencyStep && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                {[
                  { value: 'INR', label: '₹ INR', sub: 'Indian Rupee' },
                  { value: 'USD', label: '$ USD', sub: 'US Dollar' },
                  { value: 'EUR', label: '€ EUR', sub: 'Euro' },
                ].map(({ value, label, sub }) => (
                  <button
                    key={value}
                    onClick={() => setCurrency(value)}
                    style={{
                      padding: '12px 8px', borderRadius: 10, textAlign: 'center',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      background: currency === value ? current.color + '14' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${currency === value ? current.color + '45' : 'var(--border)'}`,
                      color: currency === value ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 10 }}>{sub}</div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Button className="w-full" size="lg" onClick={next}
          style={{ background: current.color, color: '#000' }}>
          {step < steps.length - 1 ? (
            <><span>Continue</span> <ChevronRight size={16} /></>
          ) : (
            'Get Started 🚀'
          )}
        </Button>

        {step < steps.length - 1 && (
          <button
            onClick={() => { updateUser({ currency }); onFinish(); }}
            style={{ width: '100%', textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Skip
          </button>
        )}
      </div>
    </motion.div>
  );
}
