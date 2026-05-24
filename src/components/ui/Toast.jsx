import { useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const icons = {
  success: <CheckCircle size={14} color="var(--accent)" />,
  info: <Info size={14} color="var(--blue)" />,
  warning: <AlertTriangle size={14} color="var(--yellow)" />,
  error: <XCircle size={14} color="var(--red)" />,
};

function ToastItem({ toast }) {
  const { dispatch } = useContext(AppContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92 }}
      className={`toast ${toast.type || 'info'}`}
    >
      {icons[toast.type] || icons.info}
      <p style={{ flex: 1 }}>{toast.message}</p>
      <button
        onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { state } = useContext(AppContext);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {state.toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
