import React, { useEffect, useState } from 'react';
import { BloodAlert, BloodRequest, UserRole, AppView } from '../../types';
import { BloodAlertCard } from '../BloodAlertCard';
import { HeartHandshake, Plus, X, Stethoscope, Building2, User, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Button';
import { Input } from '../Input';

interface RequestCardProps {
  req: BloodRequest;
  isBank: boolean;
  onValidate: (req: BloodRequest) => void;
  onClick: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ req, isBank, onValidate, onClick }) => (
  <div 
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative cursor-pointer group"
    onClick={() => onClick(req.id)}
  >
      <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                  {req.bloodType}{req.rhesus}
              </div>
              <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{req.doctorName}</h4>
                  <p className="text-xs text-gray-500">{req.location}</p>
              </div>
          </div>
          <div className="flex items-center text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              <Clock size={12} className="mr-1" /> {req.timePosted}
          </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          {isBank && req.status === 'pending' ? (
               <Button 
                  variant="primary" 
                  className="w-full text-sm py-2 bg-green-600 hover:bg-green-700 shadow-green-200 z-10 relative"
                  onClick={(e) => { e.stopPropagation(); onValidate(req); }}
               >
                  <CheckCircle size={16} /> Valider
               </Button>
          ) : (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 w-full justify-between ${
                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                  req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                  <span>
                    {req.status === 'pending' && "En attente"}
                    {req.status === 'accepted' && "Validée"}
                    {req.status === 'rejected' && "Refusée"}
                  </span>
                  <ChevronRight size={14} />
              </div>
          )}
      </div>
  </div>
);

interface DashboardProps {
  onNavigateToDetail: (type: 'ALERT' | 'REQUEST', id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToDetail }) => {
  const { user } = useAuth();
  
  const [alerts, setAlerts] = useState<BloodAlert[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'requests'>('requests');

  const [formBloodType, setFormBloodType] = useState('O');
  const [formRhesus, setFormRhesus] = useState('+');
  const [formLocation, setFormLocation] = useState(user?.location || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        if (user.role === UserRole.DONOR) {
            const data = await firebaseService.getPublicAlerts();
            setAlerts(data);
        } 
        else if (user.role === UserRole.DOCTOR) {
            const data = await firebaseService.getDoctorRequests(user.uid);
            setRequests(data);
        } 
        else if (user.role === UserRole.BLOOD_BANK) {
            if (activeTab === 'requests') {
                const data = await firebaseService.getPendingRequestsForBank();
                setRequests(data);
            } else {
                const data = await firebaseService.getPublicAlerts();
                setAlerts(data);
            }
        }
    } catch (e) {
        console.error("Error fetching data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
        await firebaseService.createBloodRequest({
            bloodType: formBloodType,
            rhesus: formRhesus,
            location: formLocation
        }, user);
        setShowCreateModal(false);
        fetchData();
    } catch (e: any) {
        alert("Erreur: " + e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleCreateDirectAlert = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
        await firebaseService.createAlert({
            bloodType: formBloodType,
            rhesus: formRhesus,
            location: formLocation
        }, user, null);
        setShowCreateModal(false);
        setActiveTab('alerts'); 
        fetchData();
    } catch (e: any) {
        alert("Erreur: " + e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleValidateRequest = async (request: BloodRequest) => {
      if(!user) return;
      if(!window.confirm(`Valider la demande de ${request.doctorName} et publier l'alerte ?`)) return;

      try {
          await firebaseService.createAlert({
              bloodType: request.bloodType,
              rhesus: request.rhesus,
              location: request.location
          }, user, request);
          alert("Demande validée et alerte publiée !");
          fetchData();
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la validation");
      }
  };

  const handleRespondAlert = async (id: string) => {
      if (!user) return;
      if(!window.confirm("Confirmez-vous votre disponibilité pour ce don ?")) return;
      
      try {
          await firebaseService.respondToAlert(id, user);
          alert("Merci ! Votre disponibilité a été enregistrée.");
      } catch (e) {
          alert("Erreur lors de la réponse.");
      }
  };

  const handleDeleteAlert = async (id: string) => {
    if(!window.confirm("Supprimer cette alerte ?")) return;
    try {
        await firebaseService.deleteAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
        alert("Impossible de supprimer.");
    }
  };

  const renderRoleBadge = () => {
      if(user?.role === UserRole.DOCTOR) return <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"><Stethoscope size={16}/> Espace Médecin</div>;
      if(user?.role === UserRole.BLOOD_BANK) return <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"><Building2 size={16}/> Espace Banque</div>;
      return <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"><User size={16}/> Espace Donneur</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
          <p className="text-gray-500 text-sm">Gérez vos activités et sauvez des vies.</p>
        </div>
        {renderRoleBadge()}
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 mb-10 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {user?.role === UserRole.DONOR && "Prêt à faire un don ?"}
                    {user?.role === UserRole.DOCTOR && "Besoin de sang en urgence ?"}
                    {user?.role === UserRole.BLOOD_BANK && "Gestion des stocks & alertes"}
                </h3>
                <p className="text-gray-500 text-sm md:text-base">
                    {user?.role === UserRole.DONOR && "Consultez les alertes ci-dessous. Votre générosité sauve des vies directement dans votre communauté."}
                    {user?.role === UserRole.DOCTOR && "Créez une demande. Elle sera transmise instantanément aux banques de sang pour validation et diffusion."}
                    {user?.role === UserRole.BLOOD_BANK && "Validez les demandes des médecins ou lancez des appels aux dons pour renflouer vos stocks."}
                </p>
                
                {(user?.role === UserRole.DOCTOR || user?.role === UserRole.BLOOD_BANK) && (
                    <div className="mt-6">
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} />
                            {user?.role === UserRole.DOCTOR ? "Nouvelle Demande" : "Créer une Alerte"}
                        </Button>
                    </div>
                )}
            </div>
            <div className="text-red-500 opacity-90">
                <HeartHandshake size={100} strokeWidth={1} />
            </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 pointer-events-none"></div>
      </div>
      
      {user?.role === UserRole.BLOOD_BANK && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Demandes Médecins
                  {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('alerts')}
                className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'alerts' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Alertes Publiques
                  {activeTab === 'alerts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
              </button>
          </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
           {user?.role === UserRole.DONOR && "Urgences en cours"}
           {user?.role === UserRole.DOCTOR && "Historique de vos demandes"}
           {user?.role === UserRole.BLOOD_BANK && (activeTab === 'requests' ? "Demandes à valider" : "Alertes en cours")}
        </h3>
        
        {loading ? (
             <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div></div>
        ) : (
            <>
                {((user?.role === UserRole.DOCTOR) || (user?.role === UserRole.BLOOD_BANK && activeTab === 'requests')) && (
                    requests.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-2xl text-gray-400 border border-dashed border-gray-200">Aucune demande trouvée.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.map(req => (
                                <RequestCard 
                                    key={req.id} 
                                    req={req} 
                                    isBank={user?.role === UserRole.BLOOD_BANK} 
                                    onValidate={handleValidateRequest}
                                    onClick={(id) => onNavigateToDetail('REQUEST', id)}
                                />
                            ))}
                        </div>
                    )
                )}

                {((user?.role === UserRole.DONOR) || (user?.role === UserRole.BLOOD_BANK && activeTab === 'alerts')) && (
                     alerts.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-2xl text-gray-400 border border-dashed border-gray-200">Aucune alerte publique pour le moment.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {alerts.map(alert => (
                                <BloodAlertCard 
                                    key={alert.id} 
                                    alert={alert} 
                                    currentUserRole={user?.role}
                                    currentUserId={user?.uid}
                                    onRespond={handleRespondAlert} 
                                    onDelete={user?.role === UserRole.BLOOD_BANK ? handleDeleteAlert : undefined}
                                    onClick={(id) => onNavigateToDetail('ALERT', id)}
                                />
                            ))}
                        </div>
                    )
                )}
            </>
        )}
      </div>

      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">
                          {user?.role === UserRole.DOCTOR ? "Nouvelle Demande" : "Nouvelle Alerte"}
                      </h3>
                      <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="flex gap-4">
                        <Input 
                            label="Groupe Sanguin" 
                            as="select" 
                            value={formBloodType}
                            onChange={(e) => setFormBloodType(e.target.value)}
                            options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'AB', label: 'AB' }, { value: 'O', label: 'O' }]} 
                        />
                         <Input 
                            label="Rhesus" 
                            as="select" 
                            value={formRhesus}
                            onChange={(e) => setFormRhesus(e.target.value)}
                            options={[{ value: '+', label: '+' }, { value: '-', label: '-' }]} 
                        />
                      </div>
                      <Input 
                        label="Localisation" 
                        value={formLocation} 
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Ville, Hôpital..."
                      />
                      
                      {user?.role === UserRole.DOCTOR && (
                          <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 mt-2">
                             Votre demande sera envoyée aux banques de sang. Une fois validée, elle sera visible par les donneurs.
                          </div>
                      )}
                       {user?.role === UserRole.BLOOD_BANK && (
                          <div className="bg-red-50 p-4 rounded-xl text-xs text-red-700 mt-2">
                             Cette alerte sera immédiatement visible par tous les donneurs.
                          </div>
                      )}

                      <div className="pt-4 flex gap-3">
                          <Button variant="outline" fullWidth onClick={() => setShowCreateModal(false)}>Annuler</Button>
                          <Button fullWidth onClick={user?.role === UserRole.DOCTOR ? handleCreateRequest : handleCreateDirectAlert} disabled={submitting}>
                              {submitting ? 'Envoi...' : 'Envoyer'}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};