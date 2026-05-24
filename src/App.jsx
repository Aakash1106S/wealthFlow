import { useContext, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/Toast';
import { OnboardingFlow } from './components/OnboardingFlow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

function ProtectedRoute({ children }) {
  const { state } = useContext(AuthContext);
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <div className="app-background" />
      <Sidebar />
      <div className="app-main-content">
        <Navbar />
        <main>{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  const { state: authState } = useContext(AuthContext);
  const location = useLocation();
  const [onboarded, setOnboarded] = useState(() => {
    return !!localStorage.getItem('onboarded');
  });

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const showOnboarding = authState.isAuthenticated && !onboarded && !isAuthPage;

  const handleOnboardingFinish = () => {
    localStorage.setItem('onboarded', 'true');
    setOnboarded(true);
  };

  return (
    <>
      {showOnboarding && <OnboardingFlow onFinish={handleOnboardingFinish} />}
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><Dashboard /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><TransactionsPage /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><AnalyticsPage /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><BudgetPage /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><ReportsPage /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout>
              <PageTransition><ProfilePage /></PageTransition>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
