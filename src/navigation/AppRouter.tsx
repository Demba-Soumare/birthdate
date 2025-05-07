import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

// Auth pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Onboarding from '../features/onboarding/Onboarding';

// App pages
import Home from '../features/home/Home';
import EventList from '../features/events/EventList';
import CreateEvent from '../features/events/CreateEvent';
import EventDetail from '../features/events/EventDetail';
import Profile from '../features/profile/Profile';
import FundraiserList from '../features/fundraisers/FundraiserList';
import FundraiserDetail from '../features/fundraisers/FundraiserDetail';
import FundraiserSuccess from '../features/fundraisers/FundraiserSuccess';
import StripeReturn from '../features/stripe/StripeReturn';
import StripeRefresh from '../features/stripe/StripeRefresh';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.hasCompletedOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  if (currentUser) {
    if (!currentUser.hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const PublicFundraiserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        } />
        <Route path="/register" element={
          <RedirectIfAuthenticated>
            <Register />
          </RedirectIfAuthenticated>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        
        {/* Public fundraiser route */}
        <Route path="/fundraiser/:id/contribute" element={
          <PublicFundraiserRoute>
            <FundraiserDetail />
          </PublicFundraiserRoute>
        } />
        
        {/* Stripe routes */}
        <Route path="/stripe/return" element={
          <ProtectedRoute>
            <StripeReturn />
          </ProtectedRoute>
        } />
        <Route path="/stripe/refresh" element={
          <ProtectedRoute>
            <StripeRefresh />
          </ProtectedRoute>
        } />
        
        {/* App routes with layout */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<Home />} />
          <Route path="/my-events" element={<EventList />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/fundraisers" element={<FundraiserList />} />
          <Route path="/fundraiser/:id" element={<FundraiserDetail />} />
          <Route path="/fundraiser/:id/success" element={<FundraiserSuccess />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;