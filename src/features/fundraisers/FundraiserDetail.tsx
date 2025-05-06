import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gift, Users, ArrowLeft, Share2, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEvent } from '../../services/eventService';
import { createCheckoutSession, createStripeConnectAccount } from '../../services/stripeService';
import { EventType } from '../../types';
import Button from '../../components/Button';
import { formatDate } from '../../utils/formatDate';


const FundraiserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  // Ajouter un état pour le message de chargement Stripe
  const [stripeLoadingMessage, setStripeLoadingMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const eventData = await getEvent(id);
        
        if (!eventData?.hasFundraiser) {
          throw new Error('Cet événement n\'a pas de cagnotte active');
        }
        
        setEvent(eventData);
      } catch (err) {
        console.error('Erreur lors du chargement de la cagnotte:', err);
        setError('Impossible de charger les détails de la cagnotte');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    if (!event) return;
    
    try {
      await navigator.share({
        title: `Cagnotte pour ${event.title}`,
        text: `Participez à la cagnotte pour ${event.title}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id || !currentUser) return;

    // 1. Vérifier si l'utilisateur a un compte Stripe Connect
    if (!currentUser.stripeAccountId) {
      console.log('Compte Stripe Connect manquant. Redirection pour création/liaison...');
      setIsProcessing(true); // Utiliser l'état existant pour désactiver le bouton
      setStripeLoadingMessage('Redirection vers Stripe pour la configuration...'); // Message spécifique
      setError(null); // Réinitialiser les erreurs précédentes

      try {
        // Vérifier que l'utilisateur et son email existent
        if (!currentUser?.uid || !currentUser?.email) {
          throw new Error('Informations utilisateur manquantes pour créer le compte Stripe.');
        }
        
        // 2. Appeler la fonction pour obtenir le lien d'onboarding avec userId et email
        const { accountLink } = await createStripeConnectAccount(currentUser.uid, currentUser.email);

        // 3. Rediriger vers Stripe
        if (accountLink) {
          window.location.href = accountLink;
          // La redirection a lieu, pas besoin de réinitialiser l'état ici
        } else {
          console.error("L'URL de redirection Stripe n'a pas été reçue.");
          setError("Erreur lors de la récupération du lien Stripe.");
          setStripeLoadingMessage(null); // Effacer le message spécifique
          setIsProcessing(false); // Réactiver le bouton en cas d'erreur
        }
      } catch (err) {
        console.error('Erreur lors de la création/récupération du lien Stripe Connect:', err);
        // Afficher l'erreur spécifique si elle existe, sinon un message générique
        const errorMessage = err instanceof Error ? err.message : 'Impossible de configurer le compte de paiement. Veuillez réessayer.';
        setError(errorMessage);
        setStripeLoadingMessage(null); // Effacer le message spécifique
        setIsProcessing(false); // Réactiver le bouton en cas d'erreur
      }
      return; // Arrêter l'exécution ici si la redirection est nécessaire
    }

    // --- Si l'utilisateur a un stripeAccountId, continuer comme avant ---
    console.log('Compte Stripe Connect trouvé. Procéder au paiement...');
    try {
      setIsProcessing(true);
      setStripeLoadingMessage(null); // S'assurer que le message Stripe est effacé
      setError(null);

      // Validation
      if (!amount) {
        setError('Veuillez entrer un montant');
        return;
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Le montant doit être supérieur à 0');
        return;
      }

      // Créer la session de paiement
      const { sessionUrl } = await createCheckoutSession(id, amountValue, message);
      
      // Rediriger vers Stripe Checkout
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Erreur lors de la création de la session de paiement:', err);
      setError('Impossible de procéder au paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [5, 10, 20, 50];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pb-8">
        <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto pb-8">
        <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
          <div className="bg-red-50 rounded-xl p-4 flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <p>{error || 'Cagnotte non trouvée'}</p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={18} />}
            className="mt-4 bg-white text-teal-700 hover:bg-teal-50"
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const progress = event.fundraiserDetails ? 
    (event.fundraiserDetails.currentAmount / event.fundraiserDetails.targetAmount) * 100 : 0;

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between text-white mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-teal-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 hover:bg-teal-500 rounded-full transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-teal-100 rounded-full p-4">
                <Gift size={32} className="text-teal-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-teal-900 mb-2">
                Cagnotte pour {event.title}
              </h1>
              <p className="text-teal-600">
                {formatDate(event.date)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-teal-600">Montant collecté</div>
                  <div className="text-2xl font-bold text-teal-700">
                    {event.fundraiserDetails?.currentAmount || 0} €
                  </div>
                </div>
                <div>
                  <div className="text-sm text-teal-600">Objectif</div>
                  <div className="text-2xl font-bold text-teal-700">
                    {event.fundraiserDetails?.targetAmount || 0} €
                  </div>
                </div>
              </div>
              <div className="w-full bg-teal-100 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-teal-900 mb-2">
                  Choisir un montant
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {predefinedAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                        amount === preset.toString()
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      {preset} €
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Autre montant"
                    className="block w-full px-4 py-3 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-teal-400">€</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-teal-900 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="block w-full px-4 py-3 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isProcessing}
                disabled={isProcessing}
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
                <span className="flex items-center gap-2">
                  {!isProcessing && <CreditCard size={20} />}
                  {isProcessing 
                    ? (stripeLoadingMessage || 'Traitement...') 
                    : `Participer avec ${amount ? `${amount} €` : 'un montant'}`}
                </span>
              </Button>
            </form>

            {event.fundraiserDetails?.participants && event.fundraiserDetails.participants.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Participants
                </h2>
                <div className="space-y-3">
                  {event.fundraiserDetails.participants.map((participant, index) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-teal-900">Participant {index + 1}</div>
                        <div className="text-lg font-bold text-teal-700">{participant.amount} €</div>
                      </div>
                      {participant.message && (
                        <p className="text-sm text-teal-600">{participant.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Participants
                </h2>
                <div className="bg-white rounded-xl p-4 text-center text-teal-600">
                  Aucun participant pour le moment
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraiserDetail;