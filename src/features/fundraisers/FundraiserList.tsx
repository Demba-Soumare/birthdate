import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Info, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEvents } from '../../services/eventService';
import { EventType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/Button';

const FundraiserList: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userEvents = await getUserEvents(currentUser.uid);
        // Filtrer uniquement les événements avec une cagnotte
        const eventsWithFundraiser = userEvents.filter(event => event.hasFundraiser);
        setEvents(eventsWithFundraiser);
      } catch (err: any) {
        console.error('Erreur lors du chargement des cagnottes:', err);
        setError('Impossible de charger les cagnottes. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser]);

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 text-white mb-6">
          <Gift size={24} />
          <h1 className="text-xl font-semibold">Cagnottes</h1>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-2">
              <Info size={20} />
              <p>{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Gift size={48} className="text-teal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-teal-900 mb-2">Aucune cagnotte active</h3>
              <p className="text-teal-600 mb-6">
                Créez un événement et activez une cagnotte pour commencer à collecter des fonds.
              </p>
              <Button 
                onClick={handleCreateEvent}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Créer un événement avec cagnotte
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/fundraiser/${event.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-teal-100"
                >
                  <div className="flex items-start gap-4">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Gift size={24} className="text-teal-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-teal-500" />
                        <span className="text-sm text-teal-600">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-teal-900 mb-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-teal-600">Collecté : </span>
                          <span className="font-medium text-teal-700">0 €</span>
                        </div>
                        <div>
                          <span className="text-teal-600">Participants : </span>
                          <span className="font-medium text-teal-700">0</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 w-full bg-teal-100 rounded-full h-1.5">
                        <div
                          className="bg-teal-600 h-1.5 rounded-full"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundraiserList;