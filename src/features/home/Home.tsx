import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, Heart, GlassWater, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { getUserEvents, deleteEvent } from '../../services/eventService';
import { EventType } from '../../types';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userEvents = await getUserEvents(currentUser.uid);
        setEvents(userEvents);
      } catch (err: any) {
        console.error('Erreur lors du chargement des événements:', err);
        setError('Impossible de charger vos événements. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser]);
  
  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }
    
    try {
      setIsDeletingId(eventId);
      await deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Impossible de supprimer l\'événement. Veuillez réessayer.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getEventIcon = (type: EventType['type']) => {
    switch (type) {
      case 'Birthday':
        return <Gift className="text-white" size={20} />;
      case 'Wedding':
        return <Heart className="text-white" size={20} />;
      case 'Anniversary':
        return <Calendar className="text-white" size={20} />;
      default:
        return <GlassWater className="text-white" size={20} />;
    }
  };
  
  const upcomingEvents = [...events]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 text-white mb-6">
          <Gift size={24} />
          <h1 className="text-xl font-semibold">Birthdate</h1>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl p-4">
          <h2 className="text-teal-900 font-medium mb-4">Événements à venir</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="text-teal-300 mx-auto mb-4" />
              <p className="text-teal-800 mb-6">
                Ajoutez votre premier événement pour commencer
              </p>
              <Button
                onClick={handleCreateEvent}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Ajouter un événement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-teal-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-teal-100/80 transition-colors group relative"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-teal-600 rounded-full p-2">
                      {getEventIcon(event.type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-teal-900">{event.title}</h3>
                    <p className="text-sm text-teal-600">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-700">
                      {getCountdown(event.date)}
                    </div>
                    <div className="text-sm text-teal-600">jours</div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteEvent(event.id, e)}
                    disabled={isDeletingId === event.id}
                    className={`absolute right-2 top-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                      ${isDeletingId === event.id ? 'bg-red-100' : 'bg-red-50 hover:bg-red-100'}`}
                  >
                    <Trash2 
                      size={16} 
                      className={`${isDeletingId === event.id ? 'text-red-300' : 'text-red-500'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCountdown = (date: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default Home;