import React, { useEffect, useState } from 'react';
import { BloodAlert, AppView, UserRole, DonorResponse } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { ChevronLeft, MapPin, Clock, AlertTriangle, Phone, Share2, Activity, User, Building2, UserMinus, CheckCircle } from 'lucide-react';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  alertId: string;
  onNavigate: (view: AppView) => void;
}

export const AlertDetails: React.FC<Props> = ({ alertId, onNavigate }) => {
  const { user } = useAuth();
  const [bloodAlert, setBloodAlert] = useState<BloodAlert | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [hasResponded, setHasResponded] = useState(false);
  const [volunteers, setVolunteers] = useState<DonorResponse[]>([]);

  const fetchAlertData = async () => {
    try {
      const data = await firebaseService.getAlertById(alertId);
      setBloodAlert(data);

      if (user) {
          if (user.role === UserRole.DONOR) {
              const responded = await firebaseService.hasUserResponded(alertId, user.uid);
              setHasResponded(responded);
          } else if (user.role === UserRole.BLOOD_BANK) {
              const donorList = await firebaseService.getAlertVolunteers(alertId);
              setVolunteers(donorList);
          }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, [alertId, user]);

  const handleRespondToggle = async () => {
      if(!bloodAlert || !user) return;
      
      const action = hasResponded ? "Vous désengager" : "Confirmez-vous votre disponibilité";
      const message = hasResponded 
        ? "La banque sera notifiée de votre annulation." 
        : `Votre numéro (${user.phone}) sera transmis à la banque pour qu'ils puissent vous contacter.`;

      if(!window.confirm(`${action} ?\n\n${message}`)) return;

      try {
          const result = await firebaseService.respondToAlert(bloodAlert.id, user);
          
          if (result === 'added') {
              setHasResponded(true);
              setBloodAlert(prev => prev ? {...prev, responseCount: (prev.responseCount || 0) + 1} : null);
          } else {
              setHasResponded(false);
              setBloodAlert(prev => prev ? {...prev, responseCount: Math.max(0, (prev.responseCount || 0) - 1)} : null);
          }
      } catch (e) {
          console.error(e);
          window.alert("Une erreur est survenue.");
      }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-red-500 rounded-full border-t-transparent"></div></div>;
  if (!bloodAlert) return <div className="p-10 text-center">Alerte introuvable</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
        <button onClick={() => onNavigate(AppView.DASHBOARD)} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ChevronLeft size={20} />
            <span className="ml-1 font-medium">Retour</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                            <AlertTriangle size={12} />
                            Urgence {bloodAlert.urgency === 'HIGH' ? 'Haute' : 'Moyenne'}
                        </div>
                        <h1 className="text-2xl font-bold mb-1">Besoin de sang {bloodAlert.bloodType}{bloodAlert.rhesus}</h1>
                        <p className="opacity-90 text-sm">Posté il y a {bloodAlert.timePosted}</p>
                    </div>
                    <div className="bg-white text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                        {bloodAlert.bloodType}{bloodAlert.rhesus}
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10">
                    <Activity size={200} />
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{bloodAlert.bankName}</h3>
                        <div className="flex items-center text-gray-500 mt-1">
                            <MapPin size={16} className="mr-1 text-red-400" />
                            {bloodAlert.bankLocation}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1 text-sm">
                            <Clock size={16} className="mr-1 text-gray-400" />
                            {bloodAlert.alertDate?.toDate().toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500">
                        <Share2 size={80}/>
                    </div>
                    <h4 className="font-semibold text-red-800 mb-2 relative z-10">Message de l'établissement</h4>
                    <p className="text-gray-700 italic relative z-10">"{bloodAlert.message || "Le patient nécessite une transfusion urgente. Merci de votre solidarité."}"</p>
                </div>

                {user?.role === UserRole.BLOOD_BANK && (
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                <User size={18} className="text-red-500"/>
                                Donneurs Volontaires
                            </h4>
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{volunteers.length}</span>
                        </div>
                        
                        {volunteers.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                                <p className="text-sm">Aucun donneur ne s'est manifesté pour le moment.</p>
                                <p className="text-xs mt-1">Les réponses apparaîtront ici en temps réel.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {volunteers.map((vol) => (
                                    <div key={vol.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border-2 border-red-100 shadow-sm shrink-0">
                                                {vol.bloodGroup}{vol.rhesus}
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-lg leading-tight">{vol.donorName}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                        <Phone size={14} className="mr-2 text-gray-500" />
                                                        <span className="font-mono font-medium text-gray-700 select-all">{vol.phoneNumber || "Non renseigné"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {vol.phoneNumber && (
                                            <a 
                                                href={`tel:${vol.phoneNumber}`} 
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium shadow-lg shadow-green-100 transition-transform active:scale-95"
                                            >
                                                <Phone size={18} fill="currentColor" />
                                                <span>Appeler</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {user?.role === UserRole.DONOR && (
                    <div className="space-y-4">
                        {hasResponded ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-scale-in">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-green-800 mb-1">Merci pour votre engagement !</h3>
                                <p className="text-green-700 text-sm mb-4">
                                    Vos coordonnées ({user.phone}) ont été transmises à l'établissement. 
                                    Gardez votre téléphone à proximité.
                                </p>
                                <Button 
                                    variant="outline" 
                                    onClick={handleRespondToggle}
                                    className="border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 bg-white"
                                >
                                    <UserMinus size={16} className="mr-2" />
                                    Je ne suis plus disponible
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                                <h3 className="font-semibold text-gray-800 mb-2">Vous correspondez à cette alerte</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    En cliquant ci-dessous, vous acceptez de partager votre numéro de téléphone 
                                    <span className="font-medium text-gray-700 mx-1">({user.phone})</span> 
                                    avec la banque de sang pour organiser le don.
                                </p>
                                <Button 
                                    fullWidth 
                                    onClick={handleRespondToggle} 
                                    className="text-lg py-4 shadow-lg shadow-red-200 animate-pulse-slow"
                                >
                                    Je suis disponible pour donner
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100">
                    <Button variant="outline" className="text-sm">
                        <Share2 size={16} className="mr-2" />
                        Partager l'alerte
                    </Button>
                    <Button variant="outline" className="text-sm">
                        <Building2 size={16} className="mr-2" />
                        Info Hôpital
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};