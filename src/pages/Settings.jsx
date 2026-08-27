import { useState, useEffect } from 'react';
import { FaBell, FaMoon, FaLanguage, FaGlobe, FaSave, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/userAuth';
import API from '../utils/axios';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    darkMode: false,
    language: 'en',
    currency: 'USD',
    twoFactor: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Buscar o perfil do usuário que contém as configurações
      const response = await API.get('/users/profile');
      if (response.data.success) {
        const data = response.data.data;
        const userSettings = data.settings || {};
        setSettings({
          emailNotifications: userSettings.emailNotifications ?? true,
          pushNotifications: userSettings.pushNotifications ?? true,
          smsAlerts: userSettings.smsAlerts ?? false,
          darkMode: userSettings.darkMode ?? false,
          language: userSettings.language || 'en',
          currency: data.currency || 'USD',
          twoFactor: userSettings.twoFactor || false,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Falha ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await API.put('/users/profile', {
        currency: settings.currency,
        settings: {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          smsAlerts: settings.smsAlerts,
          darkMode: settings.darkMode,
          language: settings.language,
          twoFactor: settings.twoFactor,
        },
      });
      if (response.data.success) {
        toast.success('Configurações salvas com sucesso!');
        // Atualizar o contexto do usuário se a moeda tiver mudado
        if (settings.currency !== user?.currency) {
          updateUser({ currency: settings.currency });
        }
        // Também atualizar o tema
        if (settings.darkMode !== user?.settings?.darkMode) {
          // O tema será aplicado globalmente (se necessário)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error(error.response?.data?.message || 'Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Carregando configurações...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400 mt-1">Gerencie as preferências da sua conta</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {/* Preferências de Notificação */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaBell className="text-blue-400" />
              Preferências de Notificação
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Notificações por E-mail</p>
                  <p className="text-xs text-slate-400">Receba atualizações por e-mail</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Notificações Push</p>
                  <p className="text-xs text-slate-400">Notificações push do navegador</p>
                </div>
                <button
                  onClick={() => handleToggle('pushNotifications')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Alertas por SMS</p>
                  <p className="text-xs text-slate-400">Receba SMS para eventos importantes</p>
                </div>
                <button
                  onClick={() => handleToggle('smsAlerts')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.smsAlerts ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaMoon className="text-blue-400" />
              Aparência
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Modo Escuro</p>
                  <p className="text-xs text-slate-400">Alternar entre tema claro e escuro</p>
                </div>
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Idioma e Moeda */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaLanguage className="text-blue-400" />
              Idioma e Moeda
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Idioma</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                  <option value="fr">Francês</option>
                  <option value="de">Alemão</option>
                  <option value="zh">Chinês</option>
                  <option value="pt">Português</option>
                  <option value="ar">Árabe</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Moeda</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - Libra Esterlina</option>
                  <option value="CAD">CAD - Dólar Canadense</option>
                  <option value="AUD">AUD - Dólar Australiano</option>
                  <option value="JPY">JPY - Iene Japonês</option>
                  <option value="NGN">NGN - Naira Nigeriana</option>
                  <option value="BRL">BRL - Real Brasileiro</option>
                  <option value="INR">INR - Rúpia Indiana</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferências de Segurança */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaGlobe className="text-blue-400" />
              Preferências de Segurança
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-xs text-slate-400">Adicione segurança extra à sua conta</p>
                </div>
                <button
                  onClick={() => handleToggle('twoFactor')}
                  className={`w-12 h-6 rounded-full transition ${
                    settings.twoFactor ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    settings.twoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="mt-8 max-w-5xl">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;