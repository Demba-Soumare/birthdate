import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { getStripeAccountStatus } from '../../services/stripeService';
import { getUserProfile } from '../../services/userService';

const StripeReturn: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      console.log("[StripeReturn] Checking status...");
      if (!currentUser || !currentUser.uid) {
        console.warn('[StripeReturn] Current user not fully loaded yet.');
      }

      console.log("[StripeReturn] Current user object from context:", currentUser);

      let accountId = currentUser?.stripeAccountId;

      if (!accountId && currentUser?.uid) {
        console.log("[StripeReturn] AccountId missing in context, fetching from Firestore...");
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          console.log("[StripeReturn] Fetched user profile from Firestore:", userProfile);
          accountId = userProfile?.stripeAccountId;
        } catch (fetchError) {
          console.error("[StripeReturn] Error fetching user profile from Firestore:", fetchError);
          setErrorMessage('Erreur lors de la récupération des informations utilisateur.');
          setStatus('error');
          return;
        }
      }

      if (!accountId) {
          setErrorMessage('Impossible de vérifier le statut : ID de compte Stripe manquant.');
          setStatus('error');
          console.error('[StripeReturn] Missing stripeAccountId even after Firestore fetch attempt');
          return;
      }

      try {
        console.log(`[StripeReturn] Using accountId: ${accountId}`);
        console.log("[StripeReturn] Calling getStripeAccountStatus...");
        const accountStatus = await getStripeAccountStatus(accountId);
        console.log("[StripeReturn] Received accountStatus:", accountStatus);

        if (accountStatus.chargesEnabled && accountStatus.payoutsEnabled) {
          console.log("[StripeReturn] Setting status to success");
          setStatus('success');
        } else {
          console.warn('[StripeReturn] Stripe account not fully enabled:', accountStatus);
          setErrorMessage('Votre compte Stripe n\'est pas encore complètement activé. Certaines fonctionnalités pourraient ne pas être disponibles.');
          console.log("[StripeReturn] Setting status to error (not fully enabled)");
          setStatus('error'); 
        }
      } catch (error) {
        console.error('[StripeReturn] Error calling getStripeAccountStatus or processing result:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de la vérification du statut Stripe.');
        console.log("[StripeReturn] Setting status to error (catch block)");
        setStatus('error');
      }
    };

    checkStatus();
  }, [currentUser]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-900">Vérification de votre compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Check size={32} className="text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-teal-900 mb-4">
              Configuration terminée !
            </h1>
            <p className="text-teal-600 mb-8">
              Votre compte Stripe est maintenant configuré. Vous pouvez commencer à recevoir des paiements.
            </p>
          </>
        ) : (
          <>
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-red-600 mb-8">
              {errorMessage || 'La configuration de votre compte Stripe n\'a pas pu être terminée ou n\'est pas encore active. Veuillez réessayer ou contacter le support.'}
            </p>
          </>
        )}
        
        <Button
          onClick={() => navigate('/home')}
          fullWidth
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default StripeReturn;