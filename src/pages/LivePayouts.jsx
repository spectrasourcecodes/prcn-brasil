import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaClock, FaDollarSign } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { mockLivePayouts } from '../data/mockData';

const LivePayouts = () => {
  const [payouts, setPayouts] = useState(mockLivePayouts);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simula novos pagamentos
      const newPayout = {
        id: Date.now(),
        user: `Usuário${Math.floor(Math.random() * 1000)}***`,
        amount: Math.floor(Math.random() * 5000) + 100,
        plan: ['Plano Ouro', 'Plano Prata', 'Plano Platina', 'Plano Diamante'][Math.floor(Math.random() * 4)],
        time: 'Agora mesmo'
      };
      setPayouts(prev => [newPayout, ...prev.slice(0, 9)]);
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const totalPayoutsToday = payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pagamentos ao Vivo</h1>
          <p className="text-slate-400 mt-1">Atualizações de saques em tempo real da nossa plataforma</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Pagamentos Hoje</p>
                <p className="text-2xl font-bold text-white">${totalPayoutsToday.toLocaleString()}</p>
              </div>
              <FaDollarSign className="text-green-500 text-3xl" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-800/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Pagamentos</p>
                <p className="text-2xl font-bold text-white">{payouts.length}</p>
              </div>
              <FaTrophy className="text-yellow-500 text-3xl" />
            </div>
          </div>
        </div>

        {/* Última Atualização */}
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
          <FaClock />
          <span>Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
        </div>

        {/* Lista de Pagamentos */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-700/50 border-b border-slate-600">
            <div className="grid grid-cols-3 text-slate-400 text-sm">
              <div>Usuário</div>
              <div>Valor</div>
              <div>Hora</div>
            </div>
          </div>
          
          <div className="divide-y divide-slate-700">
            <AnimatePresence>
              {payouts.map((payout, index) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-slate-700/30 transition"
                >
                  <div className="grid grid-cols-3 items-center">
                    <div>
                      <p className="text-white font-medium">{payout.user}</p>
                      <p className="text-xs text-slate-400">{payout.plan}</p>
                    </div>
                    <div>
                      <p className="text-green-500 font-bold">${payout.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">{payout.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivePayouts;