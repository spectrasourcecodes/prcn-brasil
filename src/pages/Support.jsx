import { useState } from 'react';
import { FaQuestionCircle, FaHeadset, FaTelegram, FaWhatsapp, FaChevronDown, FaChevronUp, FaComments, FaExternalLinkAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { ADMIN_WHATSAPP, ADMIN_TELEGRAM } from '../data/mockData';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-700 transition"
      >
        <span className="text-white font-medium">{question}</span>
        {isOpen ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-700/50">
          <p className="text-slate-300">{answer}</p>
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "Como faço para fazer um depósito?",
      answer: "Você pode fazer um depósito navegando até a página de Depósito, selecionando seu método de pagamento preferido e seguindo as instruções. Aceitamos diversas criptomoedas e transferências bancárias."
    },
    {
      question: "Quanto tempo demoram os saques?",
      answer: "Os saques são processados em até 24-48 horas após a verificação. Saques em criptomoedas geralmente são mais rápidos (30-60 minutos), enquanto transferências bancárias podem levar de 1 a 3 dias úteis."
    },
    {
      question: "Qual é o investimento mínimo?",
      answer: "O valor mínimo de investimento é de $100 para o Plano Iniciante. Cada plano tem requisitos mínimos diferentes - consulte nossa página de Planos de Investimento para mais detalhes."
    },
    {
      question: "Como ganho comissões por indicação?",
      answer: "Compartilhe seu link de indicação exclusivo com amigos. Quando eles se cadastrarem e investirem, você ganha 5% de comissão sobre o valor investido. As comissões são creditadas instantaneamente em sua conta."
    },
    {
      question: "Meu dinheiro está seguro?",
      answer: "Sim, utilizamos medidas de segurança de nível bancário, incluindo autenticação de dois fatores (2FA), armazenamento frio para criptomoedas e auditorias regulares de segurança para proteger seus fundos."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Chamado enviado! Responderemos em até 24 horas.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openLiveChat = () => {
    window.open('https://chat-support1.onrender.com', '_blank', 'width=400,height=600,scrollbars=yes');
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 lg:pl-64 pb-20 lg:pb-0">
      <Navbar />
      
      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Central de Suporte</h1>
          <p className="text-slate-400 mt-1">Obtenha ajuda com sua conta ou necessidades de trading</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opções de Contato */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Entre em Contato</h2>
            <div className="space-y-4">
              {/* Chat ao Vivo */}
              <button
                onClick={openLiveChat}
                className="w-full flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaComments className="text-2xl" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Chat ao Vivo</h3>
                  <p className="text-sm text-white/80">Converse com o suporte instantaneamente</p>
                </div>
                <FaExternalLinkAlt className="text-white/60 text-sm" />
              </button>

              <a
                href={ADMIN_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaTelegram className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Suporte por Telegram</h3>
                  <p className="text-sm text-white/80">Converse com nossa equipe instantaneamente</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${ADMIN_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition group"
              >
                <div className="bg-white/20 p-3 rounded-full mr-4 group-hover:scale-110 transition">
                  <FaWhatsapp className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold">Suporte por WhatsApp</h3>
                  <p className="text-sm text-white/80">+{ADMIN_WHATSAPP}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaHeadset className="text-blue-400" />
                Abrir um Chamado
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Assunto</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Mensagem</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Enviar Chamado
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Seção de FAQ */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaQuestionCircle className="text-blue-400" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;