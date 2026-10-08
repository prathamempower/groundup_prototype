import { useState } from 'react';
import { AuthenticatedUser, DemoPersona } from './types';

export function useAuthState(onAuthenticate: (user: AuthenticatedUser) => void) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersonaId, setLoadingPersonaId] = useState<string | null>(null);
  const [role, setRole] = useState('Developer / Owner');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDirectLogin = (persona: DemoPersona) => {
    setIsLoading(true);
    setLoadingPersonaId(persona.id);
    setTimeout(() => {
      onAuthenticate({
        id: persona.id,
        name: persona.name,
        email: persona.email,
        company: persona.company,
        role: persona.role,
        isNewUser: false,
        authProvider: 'demo',
      });
      setIsLoading(false);
      setLoadingPersonaId(null);
    }, 250);
  };

  const handleAuth = (e: React.FormEvent, provider: 'email' | 'google' = 'email') => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const derivedName = fullName.trim() || (email ? email.split('@')[0] : (activeTab === 'signup' ? 'New User' : 'Sarah Jenkins'));
      const derivedEmail = email.trim() || (activeTab === 'signup' ? 'user@company.com' : 'sarah@horizon-development.com');
      const derivedCompany = company.trim() || 'Horizon Development Group';

      onAuthenticate({
        id: `usr_${Date.now()}`,
        name: derivedName,
        email: derivedEmail,
        company: derivedCompany,
        role: role,
        isNewUser: activeTab === 'signup',
        authProvider: provider,
      });
      setIsLoading(false);
    }, 500);
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    loadingPersonaId,
    role,
    setRole,
    fullName,
    setFullName,
    company,
    setCompany,
    email,
    setEmail,
    password,
    setPassword,
    handleDirectLogin,
    handleAuth,
  };
}
