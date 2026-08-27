import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaDollarSign, FaCamera, FaSave, FaSpinner, FaTimes, FaCog, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { country } from '../data/countries';
import { profileService } from '../services/profileService';
import { useAuth } from '../auth/userAuth';
import { LockIcon } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    currency: 'USD',
    avatar: '',
    createdAt: '',
    isVerified: false,
    twoFactorEnabled: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getProfile();
      const mapped = {
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country || '',
        currency: data.currency || 'USD',
        avatar: data.avatar || '',
        createdAt: data.createdAt || data.memberSince || '',
        isVerified: data.isVerified || false,
        twoFactorEnabled: data.twoFactorEnabled || false,
      };
      setProfile(mapped);
      setFormData(mapped);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error(error.response?.data?.message || 'Falha ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        currency: formData.currency,
      });
      setProfile(formData);
      if (updateUser) updateUser(formData);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Falha ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      // Remove a flag de verificação KYC se existir
      localStorage.removeItem('kyc_verified');
      navigate('/login');
      toast.success('Saiu com sucesso');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Carregando perfil...</p>
            </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Meu Perfil</h1>
          <p className="text-slate-400 mt-1">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card do Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl p-6 text-center">
              <div className="relative inline-block">
                <img
                  src={profile.avatar || 'https://www.magnific.com/free-photos-vectors/user-profile'}
                  alt={profile.fullName || 'Usuário'}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition">
                  <FaCamera className="text-white text-sm" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mt-4">{profile.fullName || 'Nome do Usuário'}</h2>
              <p className="text-slate-400">Membro desde {profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}</p>
              <div className="mt-4 flex justify-center gap-2">
                {profile.isVerified && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs">Verificado</span>
                )}
                {profile.twoFactorEnabled && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs">2FA Ativado</span>
                )}
              </div>
            </div>
          </div>

          {/* Formulário do Perfil */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Informações Pessoais</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <FaTimes /> Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <FaUser className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Nome Completo</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.fullName || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <FaEnvelope className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">E-mail</p>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.email || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <FaPhone className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Telefone</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        placeholder="+55 11 99999-9999"
                        className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-white">{profile.phone || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <FaGlobe className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">País</p>
                    {isEditing ? (
                      <select
                        name="country"
                        value={formData.country || ''}
                        onChange={handleChange}
                        className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione o País</option>
                        {country.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-white">{profile.country || 'Não selecionado'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <FaDollarSign className="text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Moeda</p>
                    {isEditing ? (
                      <select
                        name="currency"
                        value={formData.currency || 'USD'}
                        onChange={handleChange}
                        className="bg-slate-600 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD - Dólar Americano</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - Libra Esterlina</option>
                        <option value="CAD">CAD - Dólar Canadense</option>
                        <option value="AUD">AUD - Dólar Australiano</option>
                        <option value="JPY">JPY - Iene Japonês</option>
                        <option value="CNY">CNY - Yuan Chinês</option>
                        <option value="BRL">BRL - Real Brasileiro</option>
                      </select>
                    ) : (
                      <p className="text-white">{profile.currency || 'USD'}</p>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <>
                  <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-xs text-center">
                      ℹ️ Clique em "Editar Perfil" para atualizar suas informações pessoais
                    </p>
                  </div>

                  {/* Botões de Logout e Configurações */}
                  <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/security')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-white"
                    >
                      <LockIcon /> Segurança
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-white"
                    >
                      <FaCog /> Configurações
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
                    >
                      <FaSignOutAlt /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;