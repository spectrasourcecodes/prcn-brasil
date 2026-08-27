import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaSpinner, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../utils/axios';
import { SITE_NAME } from '../data/mockData';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: resetar senha
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Digite seu endereço de e-mail');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Digite um endereço de e-mail válido');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/verify-email-exists', { email });
      if (response.data.success) {
        setResetToken(response.data.data.token);
        setStep(2);
        toast.success('E-mail verificado! Defina sua nova senha.');
      }
    } catch (error) {
      console.error('Erro na verificação do e-mail:', error);
      const message = error.response?.data?.message || 'Falha ao verificar e-mail. Tente novamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/reset-password-direct', {
        token: resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      if (response.data.success) {
        toast.success('Senha redefinida com sucesso! Faça login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      const message = error.response?.data?.message || 'Falha ao redefinir senha. Tente novamente.';
      toast.error(message);
      // Se o token expirou, volta para o passo 1
      if (error.response?.status === 400 && message.includes('expired')) {
        setStep(1);
        setResetToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Passo 1: Verificação de e-mail
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <Link to="/">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  { SITE_NAME }
                </h1>
              </Link>
              <p className="text-slate-400 mt-2">Verifique seu e-mail para redefinir a senha</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">E-mail</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Digite seu e-mail registrado para verificar sua identidade.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar E-mail'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-2">
                <FaArrowLeft className="text-sm" /> Voltar ao Login
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-center text-slate-500">
                Lembra da sua senha?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Passo 2: Redefinir senha
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                { SITE_NAME }
              </h1>
            </Link>
            <p className="text-slate-400 mt-2">Defina sua nova senha</p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                <FaCheckCircle className="text-green-500" />
                E-mail verificado: <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Nova Senha</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Confirmar Senha</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-2">
              <FaArrowLeft className="text-sm" /> Voltar ao Login
            </Link>
          </div>

          {resetToken && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-500 text-xs text-center">
                ⏳ Este link de redefinição expira em 5 minutos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;