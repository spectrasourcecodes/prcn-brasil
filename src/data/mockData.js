export const SITE_NAME = "PROCOIN LTD";
export const ADMIN_EMAIL = "support@procoin.com";
export const ADMIN_WHATSAPP = "+856484639";
export const ADMIN_TELEGRAM = "https://t.me/";

export const mockUser = {
  id: "USR8781",
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "+5511999999999",
  country: "Brasil",
  currency: "USD",
  avatar: "https://www.magnific.com/free-photos-vectors/user-profile",
  memberSince: "2026-04-26",
  verified: true,
  twoFactorEnabled: true
};

export const mockWallet = {
  totalBalance: 57840.31,
  availableBalance: 57840.31,
  totalProfit: 5480.75,
  totalDeposits: 898585.78,
  totalWithdrawals: 10.00,
  pendingWithdrawals: 2500.00,
  walletAddress: 'cersghirohginfrogdiosgfoidbfndsfhp'
};

export const mockCryptoAssets = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.254, value: 15240.50, change: 2.4, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", balance: 3.2, value: 5120.80, change: -1.2, icon: "Ξ" },
  { symbol: "BNB", name: "Binance Coin", balance: 12.5, value: 3750.00, change: 5.1, icon: "B" },
  { symbol: "SOL", name: "Solana", balance: 45.0, value: 2250.00, change: 8.3, icon: "S" },
  { symbol: "XRP", name: "Ripple", balance: 1500, value: 900.00, change: -0.5, icon: "X" },
  { symbol: "ADA", name: "Cardano", balance: 2500, value: 750.00, change: 1.2, icon: "A" }
];

export const mockForexPairs = [
  { pair: "EUR/USD", price: 1.0854, change: 0.12, spread: 0.0001 },
  { pair: "GBP/USD", price: 1.2642, change: -0.08, spread: 0.0001 },
  { pair: "USD/JPY", price: 148.32, change: 0.25, spread: 0.01 },
  { pair: "USD/CAD", price: 1.3580, change: 0.05, spread: 0.0001 },
  { pair: "AUD/USD", price: 0.6580, change: 0.18, spread: 0.0001 },
  { pair: "NZD/USD", price: 0.6120, change: -0.03, spread: 0.0001 }
];

export const mockInvestmentPlans = [
  {
    id: 1,
    name: "Iniciante",
    minAmount: 300,
    maxAmount: 1000,
    roi: 12,
    duration: 30,
    bonus: 5,
    bgClass: "from-amber-700/20",
    borderClass: "border-amber-500/30",
    colorClass: "text-amber-400"
  },
  {
    id: 2,
    name: "Bronze",
    minAmount: 1000,
    maxAmount: 5000,
    roi: 18,
    duration: 45,
    bonus: 8,
    bgClass: "from-orange-700/20",
    borderClass: "border-orange-500/30",
    colorClass: "text-orange-400"
  },
  {
    id: 3,
    name: "Prata",
    minAmount: 5000,
    maxAmount: 15000,
    roi: 24,
    duration: 60,
    bonus: 12,
    bgClass: "from-slate-700/20",
    borderClass: "border-slate-500/30",
    colorClass: "text-slate-300"
  },
  {
    id: 4,
    name: "Ouro",
    minAmount: 15000,
    maxAmount: 50000,
    roi: 32,
    duration: 90,
    bonus: 15,
    bgClass: "from-yellow-700/20",
    borderClass: "border-yellow-500/30",
    colorClass: "text-yellow-400"
  },
  {
    id: 5,
    name: "Platina",
    minAmount: 50000,
    maxAmount: 150000,
    roi: 40,
    duration: 120,
    bonus: 20,
    bgClass: "from-cyan-700/20",
    borderClass: "border-cyan-500/30",
    colorClass: "text-cyan-400"
  },
  {
    id: 6,
    name: "Diamante",
    minAmount: 150000,
    maxAmount: null,
    roi: 50,
    duration: 180,
    bonus: 25,
    bgClass: "from-purple-700/20",
    borderClass: "border-purple-500/30",
    colorClass: "text-purple-400"
  }
];

export const mockTransactions = [
  // { id: "TX001", type: "depósito", amount: 5000, currency: "USD", status: "concluído", date: "2024-01-15T10:30:00", method: "Transferência Bancária" },
  // { id: "TX002", type: "investimento", amount: 3000, currency: "USD", status: "concluído", date: "2024-01-16T14:20:00", plan: "Plano Prata" },
  // { id: "TX003", type: "lucro", amount: 540, currency: "USD", status: "concluído", date: "2024-01-20T09:15:00", plan: "Plano Prata" },
  // { id: "TX004", type: "saque", amount: 2000, currency: "USD", status: "pendente", date: "2024-01-22T16:45:00", method: "USDT (TRC20)" },
  // { id: "TX005", type: "depósito", amount: 2500, currency: "USD", status: "concluído", date: "2024-01-10T11:00:00", method: "Cartão de Crédito" },
  // { id: "TX006", type: "investimento", amount: 5000, currency: "USD", status: "concluído", date: "2024-01-12T13:30:00", plan: "Plano Ouro" },
  // { id: "TX007", type: "lucro", amount: 1600, currency: "USD", status: "concluído", date: "2024-01-18T10:00:00", plan: "Plano Ouro" },
  // { id: "TX008", type: "indicação", amount: 250, currency: "USD", status: "concluído", date: "2024-01-19T08:30:00", from: "Sarah Johnson" }
];

export const mockActiveInvestments = [
  // { id: "INV001", plan: "Plano Prata", amount: 3000, startDate: "2024-01-16", endDate: "2024-03-16", profit: 540, status: "ativo", roi: 18 },
  // { id: "INV002", plan: "Plano Ouro", amount: 5000, startDate: "2024-01-12", endDate: "2024-04-12", profit: 1600, status: "ativo", roi: 32 }
];

export const mockReferrals = [
  // { id: "REF001", name: "Mike Peterson", email: "mike@exemplo.com", date: "2024-01-10", investment: 2000, commission: 100 },
  // { id: "REF002", name: "Sarah Johnson", email: "sarah@exemplo.com", date: "2024-01-12", investment: 5000, commission: 250 },
  // { id: "REF003", name: "David Wilson", email: "david@exemplo.com", date: "2024-01-15", investment: 1500, commission: 75 },
  // { id: "REF004", name: "Emily Brown", email: "emily@exemplo.com", date: "2024-01-18", investment: 3500, commission: 175 }
];

export const mockNotifications = [
  // { id: 1, title: "Lucro de Investimento Creditado", message: "Você recebeu $540 de lucro do seu Plano Prata", time: "2 horas atrás", read: false, type: "profit" },
  // { id: 2, title: "Depósito Confirmado", message: "Seu depósito de $5.000 foi confirmado", time: "1 dia atrás", read: false, type: "deposit" },
  // { id: 3, title: "Bônus de Boas-Vindas", message: "Parabéns! Você recebeu um bônus de boas-vindas de $50", time: "2 dias atrás", read: true, type: "bonus" },
  // { id: 4, title: "Alerta de Segurança", message: "Novo login detectado no navegador Chrome", time: "3 dias atrás", read: true, type: "security" }
];

export const mockLivePayouts = [
  // { id: 1, user: "Usuário***123", amount: 1250, plan: "Plano Ouro", time: "Agora mesmo" },
  // { id: 2, user: "Trader***456", amount: 850, plan: "Plano Prata", time: "2 minutos atrás" },
  // { id: 3, user: "Crypto***789", amount: 3200, plan: "Plano Platina", time: "5 minutos atrás" },
  // { id: 4, user: "Invest***234", amount: 500, plan: "Plano Bronze", time: "8 minutos atrás" },
  // { id: 5, user: "Wealth***567", amount: 2100, plan: "Plano Diamante", time: "12 minutos atrás" }
];

export const mockSupportTickets = [
  // { id: "TKT001", subject: "Atraso no saque", status: "aberto", date: "2024-01-20", message: "Meu saque está demorando mais do que o esperado" },
  // { id: "TKT002", subject: "Dúvida sobre plano de investimento", status: "resolvido", date: "2024-01-15", message: "Posso fazer upgrade do meu plano?" }
];

export const mockMarketData = {
  totalVolume: "2.4B",
  activeUsers: "25.847",
  totalInvested: "125.5M",
  totalPaid: "98.2M"
};

export const depositMethods = [
  { id: "usdt", name: "USDT (TRC20)", min: 50, max: 100000, fee: 0, processingTime: "5-30 minutos" },
  { id: "btc", name: "Bitcoin (BTC)", min: 100, max: 100000, fee: 0, processingTime: "30-60 minutos" },
  { id: "eth", name: "Ethereum (ETH)", min: 50, max: 100000, fee: 0, processingTime: "30-60 minutos" },
  { id: "bank", name: "Transferência Bancária", min: 500, max: 50000, fee: 0, processingTime: "1-3 dias úteis" }
];

export const withdrawalMethods = [
  { id: "usdt", name: "USDT (TRC20)", min: 50, max: 50000, fee: 1, processingTime: "24-48 horas" },
  { id: "btc", name: "Bitcoin (BTC)", min: 100, max: 50000, fee: 0.0005, processingTime: "24-48 horas" },
  { id: "eth", name: "Ethereum (ETH)", min: 50, max: 50000, fee: 0.005, processingTime: "24-48 horas" }
];