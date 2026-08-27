import { useState, useEffect } from 'react';
import { FaCopy, FaShare, FaUsers, FaGift, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import API from '../utils/axios';
import { useAuth } from '../auth/userAuth';

const Referrals = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState({
    code: '',
    totalReferrals: 0,
    totalEarned: 0,
    referrals: [],
  });
  const [copied, setCopied] = useState(false);

  // Construir o link de indicação apenas se o código existir
  const referralLink = referralData.code ? `${window.location.origin}/register?ref=${referralData.code}` : '';

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // Buscar estatísticas de indicação
      const statsRes = await API.get('/referrals/stats');
      if (statsRes.data.success) {
        const data = statsRes.data.data;
        // Usar o código de indicação das estatísticas, ou do objeto user, ou fallback para vazio
        const code = data.referralCode || user?.referralCode || '';
        setReferralData({
          code: code,
          totalReferrals: data.totalReferrals || 0,
          totalEarned: data.totalEarned || 0,
          referrals: data.referrals || [],
        });
        // Se o usuário não tiver o código de indicação no contexto, atualiza
        if (!user?.referralCode && code) {
          updateUser({ referralCode: code });
        }
      } else {
        toast.error('Falha ao carregar dados de indicação');
      }
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      toast.error(error.response?.data?.message || 'Falha ao carregar dados de indicação');
      // Fallback: usar o código de indicação do usuário se disponível
      if (user?.referralCode) {
        setReferralData(prev => ({ ...prev, code: user.referralCode }));
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('Nenhum código de indicação disponível ainda');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
        <Navbar />
        <main className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Carregando dados de indicação...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Verificar se o código de indicação está disponível
  const hasReferralCode = !!referralData.code;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Programa de Indicação</h1>
          <p className="text-slate-400 mt-1">Convide amigos e ganhe 5% de comissão sobre os investimentos deles</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard title="Total de Indicações" value={referralData.totalReferrals} icon={FaUsers} />
          <StatCard title="Comissão Total" value={referralData.totalEarned} icon={FaGift} />
        </div>

        {/* Link de Indicação */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Compartilhe seu Link de Indicação</h2>
          
          {hasReferralCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Seu Código de Indicação</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralData.code}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center font-mono text-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(referralData.code)}
                    className="px-6 bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Seu Link de Indicação</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Junte-se à nossa plataforma',
                      text: `Junte-se à nossa plataforma usando meu link de indicação: ${referralLink}`,
                      url: referralLink,
                    }).catch(() => {});
                  } else {
                    copyToClipboard(referralLink);
                  }
                }}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <FaShare /> Compartilhar nas Redes Sociais
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400">Nenhum código de indicação disponível. Atualize a página ou entre em contato com o suporte.</p>
            </div>
          )}
        </div>

        {/* Lista de Indicações */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Suas Indicações</h2>
          
          {referralData.referrals.length > 0 ? (
            <div className="space-y-3">
              {referralData.referrals.map((referral, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{referral.name || referral.fullName || 'Usuário'}</p>
                    <p className="text-xs text-slate-400">
                      Entrou em: {referral.date ? new Date(referral.date).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Investimento</p>
                    <p className="font-bold text-white">${(referral.investment || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Comissão</p>
                    <p className="font-bold text-green-500">${(referral.commission || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">Nenhuma indicação ainda. Compartilhe seu link para começar a ganhar!</p>
          )}
        </div>

        {/* Informações de Bônus */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-500 text-sm text-center">
            💰 Bônus: Ganhe $50 extras para cada 5 indicações que investirem pelo menos $500!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Referrals;