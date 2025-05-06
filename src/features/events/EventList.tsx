import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EventCard from '../../components/EventCard';
import Button from '../../components/Button';
import { getUserEvents } from '../../services/eventService';
import { EventType } from '../../types';

const EventList: React.FC = () => {
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
  
  const upcomingEvents = [...events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  
  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white">
            <Calendar size={24} />
            <h1 className="text-xl font-semibold">Mes Événements</h1>
          </div>
          
          <Button
            onClick={handleCreateEvent}
            icon={<Plus size={18} />}
            className="bg-teal-700 text-white hover:bg-teal-800 hidden md:flex"
          >
            Ajouter
          </Button>
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
              <Calendar size={48} className="text-teal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-teal-900 mb-2">Aucun événement</h3>
              <p className="text-teal-600 mb-6">
                Ajoutez votre premier événement pour commencer à suivre les dates importantes.
              </p>
              <Button 
                onClick={handleCreateEvent} 
                icon={<Plus size={18} />}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Ajouter votre premier événement
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;