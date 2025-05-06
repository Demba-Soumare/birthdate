import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createStripeConnectAccount } from '../../services/stripeService';

const StripeRefresh: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const refreshStripeSession = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const { accountLink } = await createStripeConnectAccount(
          currentUser.uid,
          currentUser.email
        );
        window.location.href = accountLink;
      } catch (error) {
        console.error('Error refreshing Stripe session:', error);
        navigate('/home');
      }
    };

    refreshStripeSession();
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-teal-900">Redirection vers Stripe...</p>
      </div>
    </div>
  );
};

export default StripeRefresh;