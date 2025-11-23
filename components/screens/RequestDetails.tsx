import React, { useEffect, useState } from 'react';
import { BloodRequest, AppView, UserRole } from '../../types';
import { firebaseService } from '../../services/firebaseService';
import { ChevronLeft, CheckCircle, Clock, MapPin, User, Stethoscope, FileText } from 'lucide-react';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  requestId: string;
  onNavigate: (view: AppView) => void;
}

export const RequestDetails: React.FC<Props> = ({ requestId, onNavigate }) => {
  const { user } = useAuth();
  const [req, setReq] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReq = async () => {
    try {
      const data = await firebaseService.getRequestById(requestId);
      setReq(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReq();
  }, [requestId]);

  const handleValidate = async () => {
      if(!req || !user) return;
      if(!window.confirm("Valider cette demande ?")) return;
      try {
           await firebaseService.createAlert({
              bloodType: req.bloodType,
              rhesus: req.rhesus,
              location: req.location
          }, user, req);
          alert("Validée !");
          fetchReq();
      } catch (e) {
          alert("Erreur");
      }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-red-500 rounded-full border-t-transparent"></div></div>;
  if (!req) return <div className="p-10 text-center">Demande introuvable</div>;

  const steps = [
      { 
          status: 'created', 
          label: 'Demande créée', 
          date: req.requestDate?.toDate().toLocaleString(),
          completed: true,
          icon: FileText
      },
      { 
          status: 'validated', 
          label: 'Validée par la banque', 
          date: req.validatedAt ? req.validatedAt.toDate().toLocaleString() : null,
          completed: req.status === 'accepted',
          icon: CheckCircle
      },
      { 
          status: 'broadcast', 
          label: 'Alerte diffusée', 
          date: req.status === 'accepted' ? 'En cours de diffusion' : null,
          completed: req.status === 'accepted',
          icon: User
      }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
        <button onClick={() => onNavigate(AppView.DASHBOARD)} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ChevronLeft size={20} />
            <span className="ml-1 font-medium">Retour</span>
        </button>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Suivi de demande</h2>
                    <p className="text-sm text-gray-500">ID: {req.id.slice(0, 8)}...</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                    {req.status === 'pending' && "En attente"}
                    {req.status === 'accepted' && "Validée"}
                    {req.status === 'rejected' && "Rejetée"}
                </div>
            </div>

            <div className="p-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 flex items-center gap-6 shadow-sm">
                     <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {req.bloodType}{req.rhesus}
                     </div>
                     <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Médecin</p>
                            <div className="flex items-center font-medium text-gray-800">
                                <Stethoscope size={14} className="mr-1 text-blue-500"/>
                                {req.doctorName}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Lieu</p>
                            <div className="flex items-center font-medium text-gray-800">
                                <MapPin size={14} className="mr-1 text-red-500"/>
                                {req.location}
                            </div>
                        </div>
                     </div>
                </div>

                <div className="relative pl-4 space-y-8 mb-8">
                    <div className="absolute top-2 left-[27px] w-0.5 h-[80%] bg-gray-100 -z-10"></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 items-start relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-colors ${
                                step.completed ? 'bg-green-500 border-green-100 text-white' : 'bg-white border-gray-100 text-gray-300'
                            }`}>
                                <step.icon size={20} />
                            </div>
                            <div className="pt-2">
                                <h4 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {step.label}
                                </h4>
                                {step.date && (
                                    <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {user?.role === UserRole.BLOOD_BANK && req.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Button fullWidth onClick={handleValidate} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle size={18} className="mr-2"/>
                            Valider la demande et publier l'alerte
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};