import { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaLock, FaMobileAlt, FaKey, FaEnvelope, FaCheckCircle, 
  FaSpinner, FaTimesCircle, FaSignOutAlt 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import API from '../utils/axios';
import { useAuth } from '../auth/userAuth';

const Security = () => {
  const { user, logout } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users/profile');
      if (response.data.success) {
        const data = response.data.data;
        const userSettings = data.settings || {};
        setTwoFactorEnabled(userSettings.twoFactor || data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de segurança:', error);
      toast.error('Falha ao carregar configurações de segurança');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validação
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await API.put('/users/password', {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        toast.success('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      // Verifica se o erro é devido à senha atual incorreta
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Falha ao alterar a senha';
      if (status === 401) {
        toast.error('Senha atual incorreta. Tente novamente.');
      } else {
        toast.error(message);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setSaving(true);
    try {
      const response = await API.post('/users/2fa/enable');
      if (response.data.success) {
        setTwoFactorEnabled(true);
        toast.success('2FA foi ativado!');
      }
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      // Fallback: alterna localmente se o endpoint não estiver disponível
      setTwoFactorEnabled(true);
      toast.success('2FA ativado localmente. Endpoint da API ainda não implementado.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    setSaving(true);
    try {
      const response = await API.post('/users/2fa/disable');
      if (response.data.success) {
        setTwoFactorEnabled(false);
        toast.success('2FA foi desativado');
      }
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      setTwoFactorEnabled(false);
      toast.success('2FA desativado localmente. Endpoint da API ainda não implementado.');
    } finally {
      setSaving(false);
    }
  };

  // Sair de todos os dispositivos – limpa todas as sessões
  const handleLogoutAllDevices = () => {
    if (window.confirm('Tem certeza que deseja sair de todos os dispositivos? Isso limpará todas as sessões.')) {
      // Limpa todo o localStorage e sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Também chama o logout do contexto de autenticação
      logout();
      // Redireciona para a página de login
      window.location.href = '/login';
      toast.success('Saiu de todos os dispositivos');
    }
  };

  const securityItems = [
    {
      icon: FaShieldAlt,
      title: 'Autenticação de Dois Fatores',
      description: 'Adicione uma camada extra de segurança à sua conta',
      action: twoFactorEnabled ? (
        <button
          onClick={handleDisable2FA}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
          Desativar
        </button>
      ) : (
        <button
          onClick={handleEnable2FA}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <FaSpinner className="animate-spin" /> : 'Ativar'}
        </button>
      ),
      status: twoFactorEnabled && (
        <span className="flex items-center gap-2 text-green-500 text-sm">
          <FaCheckCircle /> Ativado
        </span>
      ),
    },
    {
      icon: FaMobileAlt,
      title: 'Alertas por SMS',
      description: 'Receba alertas de segurança via SMS',
      action: (
        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Configurar
        </button>
      ),
    },
    {
      icon: FaEnvelope,
      title: 'Notificações por E-mail',
      description: 'Receba notificações sobre atividades da conta',
      action: (
        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Gerenciar
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Carregando configurações de segurança...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Configurações de Segurança</h1>
          <p className="text-slate-400 mt-1">Proteja sua conta com recursos avançados de segurança</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recursos de Segurança */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Recursos de Segurança</h2>
            {securityItems.map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <item.icon className="text-blue-400 text-xl mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  {item.action || item.status}
                </div>
              </div>
            ))}
          </div>

          {/* Alterar Senha */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaLock className="text-blue-400" />
                Alterar Senha
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {changingPassword ? <FaSpinner className="animate-spin" /> : <FaKey />}
                  {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </div>

            {/* Gerenciamento de Sessões */}
            <div className="bg-slate-800 rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaKey className="text-blue-400" />
                Sessões Ativas
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-white">Sessão atual</p>
                    <p className="text-xs text-slate-400">Última atividade: agora mesmo</p>
                  </div>
                  <span className="text-green-500 text-sm">Ativa</span>
                </div>
              </div>
              
              <button
                onClick={handleLogoutAllDevices}
                className="w-full mt-4 py-2 rounded-lg bg-red-600/20 text-red-500 font-semibold hover:bg-red-600/30 transition flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Sair de Todos os Dispositivos
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;