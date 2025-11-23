import React from 'react';
import { BloodAlert, UserRole } from '../types';
import { MapPin, Clock, Activity, Trash2, ArrowRight } from 'lucide-react';

interface Props {
  alert: BloodAlert;
  currentUserRole?: UserRole;
  currentUserId?: string;
  onRespond: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

export const BloodAlertCard: React.FC<Props> = ({ alert, currentUserRole, currentUserId, onRespond, onDelete, onClick }) => {
  const isCreator = alert.bloodBankId === currentUserId;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3 relative overflow-hidden group">
      <div 
        className="cursor-pointer" 
        onClick={() => onClick && onClick(alert.id)}
      >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-xl shadow-red-200 shadow-lg group-hover:scale-110 transition-transform">
                {alert.bloodType}
                <sup className="text-sm">{alert.rhesus}</sup>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[120px]">{alert.hospitalName}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <MapPin size={12} className="mr-1" />
                  <span className="truncate max-w-[100px]">{alert.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-gray-400">
                <Clock size={12} className="mr-1" />
                {alert.timePosted}
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-3 relative z-10 line-clamp-2">
            {alert.message || `Recherche urgente : Groupe ${alert.bloodType}${alert.rhesus}.`}
          </p>
          
          <div className="mt-2 text-xs font-semibold text-red-400 flex items-center group-hover:translate-x-1 transition-transform">
             Voir détails <ArrowRight size={12} className="ml-1"/>
          </div>
      </div>

      <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
         <Activity size={100} />
      </div>

      <div className="mt-2 relative z-10 pt-2 border-t border-gray-50">
        {isCreator ? (
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete && onDelete(alert.id); }}
                className="w-full py-2 bg-gray-50 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-100 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 size={14} />
                Clôturer
            </button>
        ) : (
            <button 
                onClick={(e) => { e.stopPropagation(); onRespond(alert.id); }}
                className="w-full py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
                <Activity size={14} />
                Je suis disponible
            </button>
        )}
      </div>
    </div>
  );
};