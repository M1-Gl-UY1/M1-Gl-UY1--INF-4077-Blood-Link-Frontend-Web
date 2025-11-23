import React, { useState } from 'react';
import { AppView, UserRole } from '../../types';
import { Button } from '../Button';
import { Input } from '../Input';
import { Dna, ChevronLeft } from 'lucide-react';
import { firebaseService } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export const AuthScreen: React.FC<Props> = ({ view, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bloodType, setBloodType] = useState('O');
  const [rhesus, setRhesus] = useState('+');
  const [sex, setSex] = useState('M');
  const [birthDate, setBirthDate] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez entrer votre email et votre mot de passe.");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await firebaseService.login(email.trim(), password);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Échec de la connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!email || !password || !username) {
      setError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!selectedRole) {
      setError("Erreur interne: Aucun rôle sélectionné.");
      return;
    }

    setIsLoading(true);
    
    try {
      const registerData = {
        email: email.trim(),
        password,
        username,
        role: selectedRole,
        phone,
        location,
        bloodGroup: bloodType,
        rhesus,
        sexe: sex,
        dateBirth: birthDate
      };
      
      await firebaseService.register(registerData);
      await refreshUser();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLogo = () => (
    <div className="flex flex-col items-center mb-8">
      <div className="text-[#EF5350] mb-2 transform rotate-45">
        <Dna size={64} strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">BloodLink</h1>
    </div>
  );

  if (view === AppView.SPLASH) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pattern">
        {renderLogo()}
        <div className="w-full max-w-xs space-y-4">
          <Button fullWidth onClick={() => onNavigate(AppView.LOGIN)}>
            Se connecter
          </Button>
          <Button fullWidth variant="secondary" onClick={() => onNavigate(AppView.REGISTER_ROLE_SELECT)}>
            S'inscrire
          </Button>
        </div>
      </div>
    );
  }

  if (view === AppView.LOGIN) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pattern">
         <button 
          onClick={() => onNavigate(AppView.SPLASH)} 
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft size={32} />
        </button>

        {renderLogo()}
        <h2 className="text-lg font-medium mb-6 text-gray-700">Bienvenue sur <span className="text-[#EF5350] font-bold">BloodLink !</span></h2>
        
        <div className="w-full max-w-md space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm">
          {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
          
          <Input label="Email *" placeholder="Entrez votre email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Mot de passe *" placeholder="Entrez votre mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          
          <div className="pt-4">
            <Button fullWidth onClick={handleLogin} disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === AppView.REGISTER_ROLE_SELECT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pattern">
        <button 
          onClick={() => onNavigate(AppView.SPLASH)} 
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft size={32} />
        </button>

        {renderLogo()}
        <h2 className="text-lg font-medium mb-8 text-gray-700">Bienvenue sur <span className="text-[#EF5350] font-bold">BloodLink !</span></h2>
        
        <div className="w-full max-w-md space-y-4">
          <p className="text-center text-gray-500 mb-4">Quel type de personnel êtes vous ?</p>
          
          {[
            { role: UserRole.DOCTOR, label: 'Médecin' },
            { role: UserRole.DONOR, label: 'Donneur de sang' },
            { role: UserRole.BLOOD_BANK, label: 'Banque de sang' }
          ].map((item) => (
            <div 
              key={item.role}
              onClick={() => setSelectedRole(item.role)}
              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all bg-white ${
                selectedRole === item.role 
                  ? 'border-[#EF5350] shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                 selectedRole === item.role ? 'border-[#EF5350]' : 'border-gray-300'
              }`}>
                {selectedRole === item.role && <div className="w-2.5 h-2.5 rounded-full bg-[#EF5350]" />}
              </div>
              <span className="font-medium text-gray-700">{item.label}</span>
            </div>
          ))}

          <div className="pt-6">
            <Button 
              fullWidth 
              disabled={!selectedRole} 
              className={!selectedRole ? "opacity-50 cursor-not-allowed" : ""}
              onClick={() => onNavigate(AppView.REGISTER_FORM)}
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === AppView.REGISTER_FORM) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pattern py-12">
         <button 
          onClick={() => onNavigate(AppView.REGISTER_ROLE_SELECT)} 
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft size={32} />
        </button>

        {renderLogo()}
        <h2 className="text-lg font-medium mb-6 text-gray-700">Inscription <span className="text-[#EF5350] font-bold">BloodLink</span></h2>

        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && <div className="md:col-span-2 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

          <div className="md:col-span-2">
             <Input label="Nom utilisateur *" placeholder="Nom complet" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="md:col-span-2">
             <Input label="Email *" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {selectedRole === UserRole.DONOR && (
            <>
              <Input 
                label="Sexe" 
                as="select" 
                options={[
                  { value: 'M', label: 'Masculin' },
                  { value: 'F', label: 'Féminin' }
                ]} 
                value={sex}
                onChange={e => setSex(e.target.value)}
              />
              <div className="flex gap-4">
                  <Input 
                    label="Groupe" 
                    as="select" 
                    options={[
                      { value: 'A', label: 'A' },
                      { value: 'B', label: 'B' },
                      { value: 'AB', label: 'AB' },
                      { value: 'O', label: 'O' }
                    ]} 
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                  />
                   <Input 
                    label="Rhesus" 
                    as="select" 
                    options={[
                      { value: '+', label: 'Positif (+)' },
                      { value: '-', label: 'Négatif (-)' }
                    ]} 
                    value={rhesus}
                    onChange={e => setRhesus(e.target.value)}
                  />
              </div>
              <Input label="Naissance *" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              <Input label="Téléphone *" placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
            </>
          )}
          
          {selectedRole !== UserRole.DONOR && (
             <div className="md:col-span-2">
               <Input label="Localisation *" placeholder="Ville, Quartier" value={location} onChange={e => setLocation(e.target.value)} />
               <div className="mt-4">
               <Input label="Téléphone *" placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
               </div>
             </div>
          )}

          <div className="md:col-span-2">
             <Input label="Mot de passe *" placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="md:col-span-2">
             <Input label="Confirmer *" placeholder="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          <div className="md:col-span-2 text-xs text-center text-gray-500 mt-2">
             En continuant vous acceptez nos <span className="text-red-500 cursor-pointer">conditions d'utilisation</span>.
          </div>

          <div className="md:col-span-2 mt-4">
            <Button fullWidth onClick={handleRegister} disabled={isLoading}>
              {isLoading ? 'Inscription...' : 'Continuer'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};