import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaCheckCircle, 
  FaSpinner, FaTimes, FaCalendar, FaGlobe, FaMapMarkerAlt, FaBriefcase 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/userAuth';
import API from '../utils/axios';

// 🔑 Get the KYC verification code from environment variables
const KYC_CODE = import.meta.env.VITE_KYC_CODE || '768564';

// Função auxiliar para gerar URLs de placeholder aleatórias
const generateRandomImageUrl = (type) => {
  const placeholders = {
    idFront: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400&h=300&fit=crop',
    ],
    idBack: [
      'https://images.unsplash.com/photo-1554224155-26032ffc0d07?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    ],
    selfie: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    ],
    proofAddress: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop',
    ],
  };
  const options = placeholders[type] || placeholders.idFront;
  return options[Math.floor(Math.random() * options.length)];
};

const KYC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [verifiedAt, setVerifiedAt] = useState(null);
  const [kycData, setKycData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    address: '',
    occupation: '',
    idType: 'passport',
    idNumber: '',
  });

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        setLoading(true);
        const response = await API.get('/kyc/status');
        if (response.data.success) {
          const { status, verifiedAt } = response.data.data;
          setKycStatus(status);
          setVerifiedAt(verifiedAt || null);
        }
      } catch (error) {
        console.error('Erro ao buscar status do KYC:', error);
        setKycStatus('not_submitted');
      } finally {
        setLoading(false);
      }
    };
    fetchKYCStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.dateOfBirth || !formData.gender) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        personalInfo: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          address: formData.address,
          occupation: formData.occupation,
        },
        governmentId: {
          type: formData.idType,
          idNumber: formData.idNumber,
          frontImage: generateRandomImageUrl('idFront'),
          backImage: generateRandomImageUrl('idBack'),
        },
        selfieImage: generateRandomImageUrl('selfie'),
        proofOfAddress: generateRandomImageUrl('proofAddress'),
      };

      const response = await API.post('/kyc', submitData);
      if (response.data.success) {
        toast.success('KYC enviado com sucesso! Por favor, verifique seu código.');
        setKycStatus('pending');
        setShowCodeModal(true);
      }
    } catch (error) {
      console.error('Erro ao enviar KYC:', error);
      toast.error(error.response?.data?.message || 'Falha ao enviar KYC');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Updated: Verify code with server after local validation
  const handleVerifyCode = async () => {
    if (!codeInput) {
      toast.error('Por favor, insira o código de verificação');
      return;
    }

    setVerifying(true);

    // ✅ Local validation (UX only – server will validate again)
    if (codeInput !== KYC_CODE) {
      toast.error('Código de verificação inválido. Tente novamente.');
      setCodeInput('');
      setVerifying(false);
      return;
    }

    // ✅ Local validation passed – send request to server to update KYC status
    try {
      const response = await API.post('/kyc/verify', { code: codeInput });
      if (response.data.success) {
        setKycStatus('verified');
        setShowCodeModal(false);
        if (updateUser) {
          updateUser({ isVerified: true });
        }
        toast.success('Verificação KYC concluída com sucesso!');
        navigate('/withdraw');
      } else {
        toast.error(response.data.message || 'Falha ao verificar código no servidor.');
      }
    } catch (error) {
      console.error('Erro na verificação do KYC:', error);
      toast.error(error.response?.data?.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setVerifying(false);
    }
  };

  const openCodeModal = () => setShowCodeModal(true);
  const closeCodeModal = () => setShowCodeModal(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  let mainContent;

  if (kycStatus === 'verified') {
    mainContent = (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-700"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">KYC Verificado</h2>
          <p className="text-slate-400">
            Sua identidade foi verificada. Agora você tem acesso completo a todos os recursos.
          </p>
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Agora você pode depositar, sacar e investir sem restrições.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Ir para o Painel
          </button>
        </motion.div>
      </div>
    );
  } else if (kycStatus === 'pending') {
    mainContent = (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-slate-700"
        >
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <FaSpinner className="w-10 h-10 text-yellow-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">KYC em Análise</h2>
          <p className="text-slate-400">
            Sua solicitação de KYC foi enviada e está sendo analisada.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Se você recebeu um código de verificação, pode inseri-lo agora.
          </p>
          <button
            onClick={openCodeModal}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Inserir Código de Verificação
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-2 ml-2 px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            Ir para o Painel
          </button>
        </motion.div>
      </div>
    );
  } else {
    const isRejected = kycStatus === 'rejected';
    mainContent = (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Verificação KYC</h1>
          <p className="text-slate-400 mt-1">
            {isRejected
              ? 'Seu KYC anterior foi rejeitado. Atualize suas informações e envie novamente.'
              : 'Complete a verificação da sua identidade'}
          </p>
          {isRejected && (
            <p className="text-red-500 text-sm mt-2">
              ❌ Seu KYC foi rejeitado. Corrija as informações abaixo.
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Nome Completo *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="João Silva"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">E-mail *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="joao@exemplo.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Telefone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Data de Nascimento *</label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Gênero *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                  required
                >
                  <option value="">Selecione o Gênero</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Nacionalidade *</label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Brasileira"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Endereço *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua Exemplo, 123, Cidade, País"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Profissão</label>
              <div className="relative">
                <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Engenheiro de Software"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <hr className="border-slate-700 my-4" />

            <h3 className="text-lg font-bold text-white mb-4">Documento de Identificação</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Tipo de Documento *</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                  required
                >
                  <option value="passport">Passaporte</option>
                  <option value="driver_license">Carteira de Motorista</option>
                  <option value="national_id">RG / Identidade Nacional</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Número do Documento *</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="AB123456"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : 'Enviar KYC'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              * Campos obrigatórios. Suas informações são seguras e não serão compartilhadas.
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        {mainContent}
      </div>

      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Inserir Código de Verificação</h2>
                <button
                  onClick={closeCodeModal}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <FaTimes className="text-slate-400" />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                Digite o código KYC de 6 dígitos que você recebeu do suporte.
              </p>

              <div>
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Digite o código de 6 dígitos"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500 transition"
                  maxLength="6"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeCodeModal}
                  className="flex-1 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={verifying}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifying ? <FaSpinner className="animate-spin" /> : 'Verificar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KYC;