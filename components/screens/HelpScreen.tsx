import React from 'react';
import { FileText, Figma, ChevronRight, AlertCircle, Heart, Stethoscope, Building2, BookOpen, Smartphone } from 'lucide-react';

export const HelpScreen: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Centre d'Aide</h2>
        <p className="text-gray-500 mt-2">Documentation et ressources du projet BloodLink</p>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-10">
        <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="text-blue-400" /> 
                Ressources du Projet
            </h3>
            <p className="text-gray-300 text-sm mt-2">
                Accédez aux documents de conception, aux spécifications et à l'application mobile.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <a 
                href="https://www.figma.com/design/DejyRIg4eqH5Jf6BrstPg6/BloodLink?node-id=0-1&t=gHh8ftA5zzs9poVl-1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
            >
                <div className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between group h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1e1e1e] rounded-lg">
                            <Figma className="text-[#F24E1E]" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm md:text-base">Maquettes Figma</div>
                            <div className="text-xs text-gray-400">Design UI/UX complet</div>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={20} />
                </div>
            </a>

            <a 
                href="https://drive.google.com/file/d/1RgVtIhF3Y1okOwaqhVtV3kMaos9ZZHs4/view?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
            >
                <div className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between group h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1e1e1e] rounded-lg">
                            <FileText className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm md:text-base">Cahier des Charges</div>
                            <div className="text-xs text-gray-400">Spécifications (PDF)</div>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={20} />
                </div>
            </a>

            <a 
                href="https://drive.google.com/file/d/1bVrtK1X60cE8Gchz5fFBuyUjo9rrWkT3/view?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1"
            >
                <div className="bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between group h-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1e1e1e] rounded-lg">
                            <Smartphone className="text-green-400" size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-sm md:text-base">App Mobile</div>
                            <div className="text-xs text-gray-400">Télécharger l'APK</div>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={20} />
                </div>
            </a>
        </div>
      </div>

      <div className="grid gap-8">
        
        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-red-500"/> Manuel d'Utilisation
            </h3>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-lg mb-2">1. Introduction</h4>
                    <p className="text-gray-600 text-sm">
                        BloodLink connecte en temps réel les médecins ayant un besoin urgent, les banques de sang qui gèrent les stocks, et les donneurs volontaires.
                    </p>
                </div>

                <div className="p-6 bg-red-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Heart className="text-red-500" size={20} />
                        <h4 className="font-semibold text-red-900">Guide pour le Donneur</h4>
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                        <li><strong>Tableau de bord :</strong> Visualisez les urgences en cours sous forme de cartes.</li>
                        <li><strong>Répondre :</strong> Cliquez sur "Je suis disponible" pour partager votre numéro avec la banque de sang.</li>
                        <li><strong>Dons effectués :</strong> Retrouvez votre historique dans l'onglet "Dons effectués".</li>
                    </ul>
                </div>

                <div className="p-6 bg-blue-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Stethoscope className="text-blue-500" size={20} />
                        <h4 className="font-semibold text-blue-900">Guide pour le Médecin</h4>
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                        <li><strong>Créer une demande :</strong> Utilisez le bouton "+" pour spécifier un besoin (Groupe, Rhésus, Lieu).</li>
                        <li><strong>Suivi :</strong> Suivez le statut (En attente, Validée) de vos demandes directement depuis l'accueil.</li>
                        <li>La demande validée par une banque devient une alerte publique.</li>
                    </ul>
                </div>

                <div className="p-6 bg-purple-50/50">
                    <div className="flex items-center gap-3 mb-3">
                        <Building2 className="text-purple-500" size={20} />
                        <h4 className="font-semibold text-purple-900">Guide pour la Banque de Sang</h4>
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                        <li><strong>Validation :</strong> Acceptez les demandes des médecins pour les transformer en alertes.</li>
                        <li><strong>Gestion des volontaires :</strong> Accédez aux détails d'une alerte pour voir la liste des donneurs disponibles et leurs numéros de téléphone.</li>
                        <li><strong>Clôture :</strong> Supprimez une alerte une fois le besoin satisfait pour ne plus solliciter les donneurs.</li>
                    </ul>
                </div>
            </div>
        </section>

        <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-500"/> Dépannage (FAQ)
            </h3>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div>
                    <h5 className="font-semibold text-gray-900 text-sm">Erreur "Format email invalide" à la connexion</h5>
                    <p className="text-gray-600 text-sm mt-1">Vérifiez qu'il n'y a pas d'espace vide après votre adresse email. L'application nettoie automatiquement les espaces, mais soyez vigilant lors de la saisie.</p>
                </div>
                <hr className="border-gray-100"/>
                <div>
                    <h5 className="font-semibold text-gray-900 text-sm">Je ne vois pas le bouton "Je suis disponible"</h5>
                    <p className="text-gray-600 text-sm mt-1">Ce bouton est réservé aux comptes "Donneurs". Si vous êtes connecté en tant que Médecin ou Banque, déconnectez-vous et créez un compte Donneur.</p>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};