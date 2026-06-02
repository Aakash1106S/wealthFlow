import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const listener = (e) => setIsMobile(e.matches);
    setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const maxWidths = { sm: '360px', md: '460px', lg: '640px', xl: '800px' };

  // Responsive motion variants
  const modalVariants = {
    initial: isMobile 
      ? { y: '100%', opacity: 1, scale: 1 } 
      : { scale: 0.94, opacity: 0, y: 12 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: isMobile 
      ? { y: '100%', opacity: 1, scale: 1 } 
      : { scale: 0.94, opacity: 0, y: 12 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-box"
            style={{ maxWidth: isMobile ? '100%' : (maxWidths[size] || maxWidths.md) }}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: isMobile ? 26 : 28, stiffness: isMobile ? 240 : 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Indicator for Mobile Bottom Sheet */}
            {isMobile && (
              <div className="w-10 h-1 bg-[rgba(255,255,255,0.15)] rounded-full mx-auto mb-4 shrink-0" />
            )}

            <div className="modal-header flex items-center justify-between mb-5">
              <h2 className="modal-title font-semibold text-[var(--text-primary)] text-sm md:text-base">{title}</h2>
              <button 
                className="modal-close w-7 h-7 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] cursor-pointer flex items-center justify-center transition-all shrink-0" 
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={14} />
              </button>
            </div>
            <div className="w-full">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
