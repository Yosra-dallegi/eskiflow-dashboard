import React, { useState } from 'react';
import { ShieldAlert, LogIn, Mail, ChevronDown, UserCheck, Lock, AlertTriangle } from 'lucide-react';
import { CDZ_LIST, ManagerUser } from '../data/cdzHierarchy';

interface AccessDeniedScreenProps {
  currentEmail: string;
  onSwitchEmail: (newEmail: string) => void;
  managersList: ManagerUser[];
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  currentEmail,
  onSwitchEmail,
  managersList
}) => {
  const [inputEmail, setInputEmail] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = inputEmail.trim() || selectedPreset;
    if (target) {
      onSwitchEmail(target);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* En-tête sécurisé */}
        <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 ring-8 ring-white/10 shadow-lg">
            <ShieldAlert className="w-9 h-9 text-white animate-pulse" />
          </div>
          
          <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Périmètre de sécurité
          </span>
          <h1 className="text-2xl font-black tracking-tight">Accès Non Autorisé</h1>
          <p className="text-rose-100 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            Vos identifiants ne sont pas enregistrés dans les droits d'accès de cette application.
          </p>
        </div>

        {/* Corps */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Badge email rejeté */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 min-w-0">
              <span className="font-semibold block text-slate-700 mb-0.5">Adresse email non reconnue :</span>
              <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 truncate block">
                {currentEmail || '(Aucun email renseigné)'}
              </span>
              <p className="text-rose-700/80 mt-1 leading-normal">
                Conformément à la politique Vilavi, l'accès aux données des tâches, visites géolocalisées, frigos et ventes est strictement restreint.
              </p>
            </div>
          </div>

          {/* Formulaire de connexion avec un compte autorisé */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Se connecter avec un compte autorisé
              </label>
              <div className="relative">
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    setSelectedPreset(e.target.value);
                    if (e.target.value) setInputEmail('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="">-- Choisir un profil autorisé dans la liste --</option>
                  <optgroup label="👑 Espace Managers (Accès 360°)">
                    <option value="MANAGER">👑 Tous les Managers (Accès global)</option>
                    {managersList.map((m) => (
                      <option key={m.email} value={m.email}>
                        👑 {m.nom} ({m.email})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="👤 Chefs de Zone (CDZ)">
                    {CDZ_LIST.map((cdz) => (
                      <option key={cdz.email} value={cdz.email}>
                        👤 {cdz.name} ({cdz.email})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">ou saisir votre email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="email"
                  placeholder="nom.prenom@vilavi.tn"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (e.target.value) setSelectedPreset('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputEmail.trim() && !selectedPreset}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Valider et accéder à l'application</span>
            </button>
          </form>

          {/* Contact Administrateur */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">
              Vous faites partie de l'équipe et devriez avoir accès ?
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact : <strong>oubaiedallah.woissoissi@vilavi.tn</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
