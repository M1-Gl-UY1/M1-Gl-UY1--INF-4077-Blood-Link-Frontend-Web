import React, { useState, useEffect } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { firebaseService } from '../../services/firebaseService';
import { UserRole } from '../../types';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      location: '',
      bloodType: '',
      rhesus: '',
      dateBirth: ''
  });

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              location: user.location || '',
              bloodType: user.bloodType || 'A',
              rhesus: user.rhesus || '+',
              dateBirth: user.dateBirth || ''
          });
      }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        await firebaseService.updateUserProfile(user.uid, user.role, {
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            bloodType: formData.bloodType,
            rhesus: formData.rhesus,
            dateBirth: formData.dateBirth
        });
        await refreshUser();
        setIsEditing(false);
        alert("Profil mis à jour avec succès");
    } catch (e) {
        alert("Erreur lors de la mise à jour");
    } finally {
        setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="h-32 bg-gradient-to-r from-red-400 to-[#EF5350]"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-center md:justify-start -mt-12 mb-6">
             <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
               <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                 <User size={40} />
               </div>
             </div>
             <div className="absolute bottom-0 md:left-20 bg-[#4798B8] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#3684a3]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
             {user.role === UserRole.DONOR && (
                <div className="bg-[#4798B8] text-white rounded-xl p-6 flex-1 flex flex-col justify-between shadow-lg shadow-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-medium opacity-90">{user.name}</h3>
                        <p className="text-sm opacity-75 mb-4">{user.phone}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider">Groupe</p>
                                <p className="text-2xl font-bold">{user.bloodType}{user.rhesus}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider">Sexe</p>
                                <p className="text-2xl font-bold">{user.sex}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider">Age</p>
                                <p className="text-2xl font-bold">{user.age ? `${user.age} ans` : '--'}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider">Dernier don</p>
                                <p className="text-lg font-bold">{user.lastGive || '--'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <User size={180} />
                    </div>
                </div>
             )}
             
             {user.role !== UserRole.DONOR && (
                 <div className="bg-gray-800 text-white rounded-xl p-6 flex-1 flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-medium opacity-90">{user.name}</h3>
                        <p className="text-sm opacity-75 mb-4">{user.role}</p>
                        <div className="mt-4">
                             <p className="text-xs opacity-60 uppercase tracking-wider">Email</p>
                             <p className="font-bold">{user.email}</p>
                        </div>
                         <div className="mt-4">
                             <p className="text-xs opacity-60 uppercase tracking-wider">Location</p>
                             <p className="font-bold">{user.location}</p>
                        </div>
                    </div>
                 </div>
             )}

             <div className="flex-[2]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Modifier le profil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input 
                        label="Nom *" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                   <Input 
                        label="Email" 
                        value={formData.email} 
                        disabled 
                        className="bg-gray-100 cursor-not-allowed"
                    />
                   
                   {user.role === UserRole.DONOR && (
                    <>
                       <Input 
                            label="Groupe" 
                            as="select" 
                            value={formData.bloodType}
                            onChange={e => setFormData({...formData, bloodType: e.target.value})}
                            options={[{value: 'A', label: 'A'}, {value: 'B', label: 'B'}, {value: 'AB', label: 'AB'}, {value: 'O', label: 'O'}]} 
                        />
                       <Input 
                            label="Rhesus" 
                            as="select" 
                            value={formData.rhesus}
                            onChange={e => setFormData({...formData, rhesus: e.target.value})}
                            options={[{value: '+', label: 'Positif'}, {value: '-', label: 'Négatif'}]} 
                        />
                       <Input 
                            label="Naissance *" 
                            type="date" 
                            value={formData.dateBirth}
                            onChange={e => setFormData({...formData, dateBirth: e.target.value})}
                        />
                    </>
                   )}
                   
                   <Input 
                        label="Téléphone *" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    
                    {user.role !== UserRole.DONOR && (
                         <Input 
                            label="Localisation *" 
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    )}

                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleUpdate} disabled={isLoading}>
                        {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};