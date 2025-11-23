import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Activity } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

export const MedicalFolder: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        if (user) {
            try {
                const data = await firebaseService.getDonationHistory(user.uid);
                setHistory(data);
            } catch (error) {
                console.error("Error fetching history", error);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
      return <div className="p-8 text-center text-gray-500">Chargement de votre dossier...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Dossier Médical</h2>
            <p className="text-gray-500">Historique de vos actions et dons</p>
        </div>
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
            {history.length} Action(s)
        </div>
      </div>
      
      {history.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-gray-300">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FileText size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun historique</h3>
              <p className="text-gray-500 mt-2">Vous n'avez pas encore effectué de don ou répondu à une alerte.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-400"></div>
                
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 rounded-xl text-red-500">
                        <Activity size={24} />
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{item.dateFormatted}</span>
                </div>

                <h3 className="font-semibold text-gray-800 text-lg mb-1">Promesse de don</h3>
                <p className="text-sm text-gray-500 mb-4">{item.hospitalName || "Hôpital"}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status === 'completed' ? 'Effectué' : 'En attente'}
                    </span>
                    <button className="text-xs text-red-500 font-medium hover:underline">Voir détails</button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};