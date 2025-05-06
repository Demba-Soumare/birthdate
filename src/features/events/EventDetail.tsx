import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Gift, Share2, Pencil, Trash2, AlertCircle, ArrowLeft, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEvent, deleteEvent, updateEvent } from '../../services/eventService';
import { createStripeConnectAccount } from '../../services/stripeService';
import { EventType } from '../../types';
import Button from '../../components/Button';
import { formatDate, getCountdown, formatCountdown } from '../../utils/formatDate';

interface FundraiserForm {
  targetAmount: string;
  description: string;
  endDate: string;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFundraiserForm, setShowFundraiserForm] = useState(false);
  const [isCreatingFundraiser, setIsCreatingFundraiser] = useState(false);
  const [isCreatingStripeAccount, setIsCreatingStripeAccount] = useState(false);
  const [fundraiserForm, setFundraiserForm] = useState<FundraiserForm>({
    targetAmount: '',
    description: '',
    endDate: '',
  });
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const eventData = await getEvent(id);
        setEvent(eventData);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'événement:', err);
        setError('Impossible de charger les détails de l\'événement');
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
        title: event.title,
        text: `${event.title} - ${formatDate(event.date)}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  const handleDelete = async () => {
    if (!event || !window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    
    try {
      setIsDeleting(true);
      await deleteEvent(event.id);
      navigate('/my-events');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer l\'événement');
      setIsDeleting(false);
    }
  };

  const handleCreateFundraiser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id || !currentUser) return;

    try {
      setIsCreatingFundraiser(true);
      
      // Validation du formulaire
      if (!fundraiserForm.targetAmount || !fundraiserForm.description || !fundraiserForm.endDate) {
        setError('Veuillez remplir tous les champs');
        return;
      }

      const targetAmount = parseFloat(fundraiserForm.targetAmount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        setError('Le montant cible doit être un nombre positif');
        return;
      }

      const endDate = new Date(fundraiserForm.endDate);
      if (endDate < new Date()) {
        setError('La date de fin doit être dans le futur');
        return;
      }

      // Créer le compte Stripe Connect
      setIsCreatingStripeAccount(true);
      const { accountLink } = await createStripeConnectAccount(
        currentUser.uid,
        currentUser.email
      );

      // Mise à jour de l'événement
      await updateEvent(id, {
        hasFundraiser: true,
        fundraiserDetails: {
          targetAmount,
          description: fundraiserForm.description,
          endDate,
          currentAmount: 0,
          participants: [],
        },
      });

      // Redirection vers Stripe pour compléter l'onboarding
      window.location.href = accountLink;
    } catch (err) {
      console.error('Erreur lors de la création de la cagnotte:', err);
      setError('Impossible de créer la cagnotte');
    } finally {
      setIsCreatingFundraiser(false);
      setIsCreatingStripeAccount(false);
    }
  };

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
            <p>{error || 'Événement non trouvé'}</p>
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

  const daysLeft = getCountdown(event.date);
  const countdown = formatCountdown(daysLeft);

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
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-teal-500 rounded-full transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => navigate(`/event/${event.id}/edit`)}
              className="p-2 hover:bg-teal-500 rounded-full transition-colors"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 hover:bg-red-500 rounded-full transition-colors disabled:opacity-50"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          {event.imageUrl ? (
            <div className="relative h-48 bg-teal-100">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ) : (
            <div className="h-48 bg-teal-100 flex items-center justify-center">
              <Calendar size={64} className="text-teal-300" />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-teal-500" />
              <span className="text-sm font-medium text-teal-600">
                {formatDate(event.date)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-teal-900 mb-4">
              {event.title}
            </h1>

            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="text-sm text-teal-600 mb-1">Compte à rebours</div>
              <div className="text-3xl font-bold text-teal-700">{countdown}</div>
            </div>

            {event.hasFundraiser ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate(`/fundraiser/${event.id}`)}
                icon={<Gift size={20} />}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Voir la cagnotte
              </Button>
            ) : showFundraiserForm ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-teal-900 flex items-center gap-2">
                  <Gift size={20} />
                  Créer une cagnotte
                </h3>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateFundraiser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-teal-900 mb-1">
                      Montant cible
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={fundraiserForm.targetAmount}
                        onChange={(e) => setFundraiserForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                        className="block w-full pl-4 pr-8 py-2.5 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-teal-400">€</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teal-900 mb-1">
                      Description
                    </label>
                    <textarea
                      value={fundraiserForm.description}
                      onChange={(e) => setFundraiserForm(prev => ({ ...prev, description: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      rows={3}
                      placeholder="Décrivez l'objectif de cette cagnotte..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-teal-900 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={fundraiserForm.endDate}
                      onChange={(e) => setFundraiserForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-white border border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => setShowFundraiserForm(false)}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isCreatingFundraiser}
                      icon={<Gift size={20} />}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Créer la cagnotte
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowFundraiserForm(true)}
                icon={<Gift size={20} />}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Créer une cagnotte
              </Button>
            )}
          </div>
        </div>
      </div>
      {isCreatingStripeAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-teal-900 text-center">
                Redirection sécurisée vers Stripe...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;