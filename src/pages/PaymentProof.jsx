import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCheckCircle, FaArrowLeft, FaSpinner, FaUpload, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { investmentService } from '../services/investmentService';
import { adminWalletService } from '../services/adminWalletService';
import API from '../utils/axios';

const PaymentProof = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { investmentId, amount, planName, type = 'investment' } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!investmentId) {
      toast.error('Requisição inválida');
      navigate('/plans');
      return;
    }
    fetchPaymentDetails();
  }, [investmentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const wallets = await adminWalletService.getWallets();
      const cryptoWallet = wallets.find(w => w.type === 'crypto') || wallets[0];
      setWallet(cryptoWallet);
    } catch (error) {
      console.error('Erro ao buscar detalhes de pagamento:', error);
      toast.error('Falha ao carregar instruções de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter menos de 5MB');
        e.target.value = '';
        return;
      }
      // Validar tipo do arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Por favor, envie um arquivo JPG, PNG ou PDF');
        e.target.value = '';
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setProofFile(null);
    setPreviewUrl('');
    setUploadProgress(0);
    document.getElementById('file-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      toast.error('Por favor, envie um comprovante de pagamento');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      // Criar FormData para upload do arquivo
      const formData = new FormData();
      formData.append('proofImage', proofFile);
      formData.append('type', type);
      formData.append('amount', amount || 0);
      formData.append('description', `${type === 'investment' ? 'Investimento' : 'Depósito'} - comprovante de pagamento`);

      // Enviar para o servidor - fará upload para o Cloudinary e salvará no modelo Proofs
      const response = await API.post(`/proofs/${investmentId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percentCompleted, 95));
        },
      });

      setUploadProgress(100);

      if (response.data.success) {
        toast.success('Comprovante enviado com sucesso! Seu investimento será verificado.');
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Falha ao enviar comprovante');
      }
    } catch (error) {
      console.error('Erro no envio do comprovante:', error);
      setUploadProgress(0);
      toast.error(error.response?.data?.message || 'Falha ao enviar comprovante. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Endereço copiado!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition"
        >
          <FaArrowLeft /> Voltar
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Confirmação de Pagamento</h1>
          <p className="text-slate-400 mt-1">Complete seu {type === 'investment' ? 'investimento' : 'depósito'} enviando o comprovante de pagamento</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 space-y-6"
        >
          {/* Resumo do Investimento/Depósito */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Detalhes do {type === 'investment' ? 'Investimento' : 'Depósito'}</p>
            <div className="mt-2 flex justify-between">
              <span className="text-white font-medium">Plano</span>
              <span className="text-white">{planName || 'N/A'}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white font-medium">Valor</span>
              <span className="text-white">${amount || '0'}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white font-medium">Referência</span>
              <span className="text-white font-mono text-sm">{investmentId?.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          {/* Instruções de Pagamento */}
          {wallet && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Instruções de Pagamento</p>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-slate-400 text-xs">Moeda</span>
                  <p className="text-white font-medium">{wallet.currency}</p>
                </div>
                {wallet.type === 'crypto' && (
                  <div>
                    <span className="text-slate-400 text-xs">Rede</span>
                    <p className="text-white font-medium">{wallet.details?.network || 'N/A'}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-xs">Endereço</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-white break-all flex-1">{wallet.address}</code>
                    <button
                      onClick={copyAddress}
                      className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition flex-shrink-0"
                    >
                      <FaCopy className="text-white text-sm" />
                    </button>
                  </div>
                </div>
                {wallet.type === 'pix' && (
                  <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <p className="text-emerald-400 text-sm font-medium">Chave PIX</p>
                    <p className="text-white text-sm break-all">{wallet.address}</p>
                  </div>
                )}
                {wallet.type === 'bank' && (
                  <div className="mt-2 text-xs space-y-1">
                    <p><span className="text-slate-400">Banco:</span> {wallet.details?.bankName}</p>
                    <p><span className="text-slate-400">Nome da Conta:</span> {wallet.details?.accountName}</p>
                    <p><span className="text-slate-400">Número da Conta:</span> {wallet.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload do Comprovante */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Enviar Comprovante de Pagamento</label>
              <div className="relative">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition cursor-pointer"
                />
                {proofFile && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition"
                  >
                    <FaTimes className="text-red-400 w-4 h-4" />
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-2 relative">
                  <img src={previewUrl} alt="Pré-visualização do comprovante" className="max-h-48 rounded-lg object-contain border border-slate-600" />
                  <p className="text-xs text-slate-400 mt-1">{proofFile?.name}</p>
                </div>
              )}
              <p className="text-slate-400 text-xs mt-1">Formatos suportados: JPG, PNG, PDF (Máx 5MB)</p>
            </div>

            {/* Progresso do Upload */}
            {submitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">Enviando... {uploadProgress}%</p>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="flex items-center gap-2 text-green-500 justify-center">
                <FaCheckCircle /> Upload concluído!
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !proofFile}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <FaUpload /> Enviar Comprovante
                </>
              )}
            </button>
          </form>

          <p className="text-yellow-500 text-xs text-center">
            ⚠️ Certifique-se de que o comprovante mostra claramente os detalhes da transação. A verificação pode levar até 24 horas.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentProof;