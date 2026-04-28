/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLaunchParams, useSignal } from '@telegram-apps/sdk-react';
import { hapticFeedback, miniApp } from '@telegram-apps/sdk';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Wallet, Sparkles, MessageSquare, Bell, 
  Settings, Rocket, Zap, ChevronLeft, Globe, 
  Music, Film, Trophy, LayoutGrid, Info, Mic2, Store
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { apiService, Artist } from './services/apiService';

// --- Components ---

function ActionCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left flex flex-col gap-3 shadow-sm"
    >
      <div className="p-2 w-fit rounded-xl bg-[var(--surface2)] shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold opacity-90 leading-tight">{title}</h4>
        <p className="text-[10px] opacity-40 font-medium uppercase tracking-tighter">{subtitle}</p>
      </div>
    </motion.button>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-[var(--purple)] scale-110" : "opacity-40"
      )}
    >
      <div className="relative">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

// --- Main App ---

export default function App() {
  let lp: any = null;
  try {
    lp = useLaunchParams();
  } catch (e) {
    console.warn("Launch params not found, using fallback or mock");
  }

  const [screen, setScreen] = useState<'home' | 'artists' | 'dashboard' | 'mgmt' | 'tutorial' | 'bater-ponto' | 'charts' | 'market'>('home');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [actionCategory, setActionCategory] = useState<string>('comentarios');

  // Fallback definitivo para o Telegram
  const getTgUser = () => {
    try {
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp?.initDataUnsafe?.user) {
        console.log("Telegram User detectado:", webApp.initDataUnsafe.user);
        return webApp.initDataUnsafe.user;
      }
      
      // Tenta o LaunchParams do SDK moderno
      if (lp?.initData?.user) {
        return lp.initData.user;
      }

      // Tenta via URL Search Params (fallback manual)
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('tgId') || urlParams.get('userId') || urlParams.get('id');
      if (urlId) {
        console.log("ID detectado via URL:", urlId);
        return { id: parseInt(urlId), first_name: "Usuario", last_name: "URL" };
      }

      // Se estiver em modo desenvolvimento (preview), simula um usuário para não ficar vazio
      if (window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost') || window.location.hostname.includes('github.io')) {
         console.warn("Ambiente externo detectado. Simulando ID para testes.");
         return { id: 123456, first_name: "Visitante", last_name: "Preview" };
      }
    } catch (e) {
      console.error("Erro ao ler dados do Telegram:", e);
    }
    return null;
  };

  const user = getTgUser();
  const tgId = user?.id?.toString() || "000000";

  useEffect(() => {
    // Inicialização oficial do Telegram
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        console.log("Telegram WebApp pronto.");
      }
    } catch (e) {
      console.warn("Telegram SDK not available");
    }

    setSdkReady(true);
  }, []);

  useEffect(() => {
    if (tgId !== "000000" && sdkReady) {
      loadArtists();
    }
  }, [tgId, sdkReady]);

  useEffect(() => {
    if (screen === 'artists' || screen === 'charts') {
      loadArtists();
    }
  }, [screen]);

  const loadArtists = async () => {
    setLoading(true);
    const data = await apiService.getArtistsByTg(tgId);
    setArtists(data);
    // Se um artista já estiver selecionado, atualiza ele na memória
    if (selectedArtist) {
      const updated = data.find(a => a.nome === selectedArtist.nome);
      if (updated) setSelectedArtist(updated);
    }
    setLoading(false);
  };

  const handleActionSubmit = async () => {
    if (!selectedArtist) return;
    setLoading(true);
    // Simulação de registro - no futuro pode integrar com uma rota de 'save_log' no seu script
    safeHaptic(() => hapticFeedback.notificationOccurred('success'));
    alert(`Ação de "${actionCategory.toUpperCase()}" registrada para ${selectedArtist.nome}! Seus pontos serão processados.`);
    await loadArtists(); // Recarrega para ver se houve mudança no status/saldo
    setScreen('dashboard');
    setLoading(false);
  };

  const handleStartProject = async (type: 'tour' | 'cinema') => {
    if (!selectedArtist) return;
    setLoading(true);
    try {
      if (type === 'tour') {
        await apiService.buyTour({
          nome: selectedArtist.nome,
          tipo: "Nacional",
          titulo: `Tour de ${selectedArtist.nome}`,
          dataInicio: new Date().toISOString().split('T')[0],
          qtd: 10,
          continente: "América do Sul"
        });
      } else {
        await apiService.buyCinema({
          nome: selectedArtist.nome,
          titulo: `Filme: ${selectedArtist.nome}`,
          tipo: "Drama",
          genero: "Musical",
          dataInicio: new Date().toISOString().split('T')[0]
        });
      }
      loadArtists();
      setScreen('mgmt');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const safeHaptic = (action: () => void) => {
    try {
      action();
    } catch (e) {
      console.warn('Haptic feedback error:', e);
    }
  };

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setScreen('dashboard');
    safeHaptic(() => hapticFeedback.impactOccurred('light'));
  };

  const navigateBack = () => {
    if (screen === 'dashboard') setScreen('artists');
    else if (screen === 'mgmt') setScreen('dashboard');
    else if (screen === 'bater-ponto') setScreen('dashboard');
    else if (screen === 'charts' || screen === 'market') setScreen('home');
    else setScreen('home');
    safeHaptic(() => hapticFeedback.impactOccurred('light'));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val).replace('R$', '$EC');
  };

  return (
    <div className="min-h-screen bg-[#08010f] text-[#f0e8ff] flex flex-col overflow-hidden relative">
      {!sdkReady && (
        <div className="fixed inset-0 z-[100] bg-[#08010f] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--purple)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="bebas text-xl tracking-widest animate-pulse">EMPIRE HUB</p>
            </div>
        </div>
      )}
      {/* Background Decor */}
      <div className="ambient amb1"></div>
      <div className="ambient amb2"></div>

      {/* Header */}
      <header className="p-6 pb-2 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {screen !== 'home' ? (
            <button onClick={navigateBack} className="p-2 rounded-full bg-[var(--surface)] border border-[var(--border)]">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="bebas text-3xl tracking-widest bg-gradient-to-br from-[var(--gold)] to-[var(--purple)] bg-clip-text text-transparent">
              EMPIRE
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
               <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-[10px] font-bold">
                 {(user.firstName || user.first_name || "U").charAt(0)}
               </div>
               <span className="text-[10px] font-bold opacity-70">
                 {user.username || user.firstName || user.first_name || "Usuário"}
               </span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-4 relative z-10">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center py-4">
                <h1 className="bebas text-5xl tracking-widest mb-1 italic text-white">EMPIRE HUB</h1>
                <p className="text-[10px] opacity-40 uppercase tracking-[0.4em]">Entertainment Professional Network</p>
                <p className="text-[8px] opacity-20 mt-1 uppercase font-bold">ID: {tgId}</p>
              </div>

              {selectedArtist && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setScreen('dashboard')}
                  className="glass-card p-4 border-l-4 border-l-[var(--purple)] flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
                >
                  <img src={selectedArtist.foto} className="w-12 h-12 rounded-full border border-[var(--purple)] object-cover" />
                  <div className="flex-1">
                    <p className="text-[8px] uppercase font-bold opacity-40 tracking-widest">Artista Ativo</p>
                    <h4 className="font-bold text-sm tracking-tight">{selectedArtist.nome}</h4>
                    <p className="text-[10px] font-black text-[var(--gold)]">{formatCurrency(selectedArtist.saldo)}</p>
                  </div>
                  <Rocket size={18} className="text-[var(--purple)] animate-bounce-slow" />
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div 
                  onClick={() => setScreen('artists')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--purple)]/10 border border-[var(--purple)]/20 flex items-center justify-center text-[var(--purple)] group-hover:bg-[var(--purple)] group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Meus Artistas</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Gestão e Portfólio</p>
                  </div>
                </div>

                  <div 
                    onClick={() => setScreen('charts')}
                    className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center text-[var(--neon)] group-hover:bg-[var(--neon)] group-hover:text-black transition-colors">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-tight">Ranking Global</h3>
                      <p className="text-[10px] opacity-40 uppercase font-medium">Charts & Prestige</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setScreen('market')}
                    className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--green)]/10 border border-[var(--green)]/20 flex items-center justify-center text-[var(--green)] group-hover:bg-[var(--green)] group-hover:text-black transition-colors">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-tight">Empire Market</h3>
                      <p className="text-[10px] opacity-40 uppercase font-medium">Investimentos</p>
                    </div>
                  </div>
              </div>

              <div className="glass-card p-5 border-dashed border-2 border-[var(--border)] opacity-60">
                 <div className="flex items-center gap-3 mb-2">
                    <Info size={16} className="text-[var(--gold)]" />
                    <h4 className="bebas text-lg tracking-wider">Como Funciona?</h4>
                 </div>
                 <p className="text-[10px] leading-relaxed">
                   Seu objetivo é tornar seu artista o #1 do mundo. 
                   Registre atividades diárias (Bater Ponto) para ganhar Prestige e Empire Coins.
                 </p>
              </div>
            </motion.div>
          )}

          {screen === 'artists' && (
            <motion.div
              key="artists"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="bebas text-3xl tracking-widest">Seu Portfólio</h2>
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Artistas sob sua gestão</p>
              </div>

              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-2xl bg-[var(--surface)] animate-pulse" />
                  ))}
                </div>
              ) : artists.length === 0 ? (
                <div className="text-center py-10 px-6 glass-card border-dashed border-2">
                  <User size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase mb-2 tracking-widest">Nenhum Artista Encontrado</p>
                  <p className="text-[10px] opacity-50 mb-6 leading-relaxed">
                    Seu ID do Telegram ({tgId}) não possui artistas vinculados no banco de dados. 
                    Certifique-se de que seu artista foi cadastrado e validado pela Empire.
                  </p>
                  <button 
                    onClick={() => setScreen('tutorial')}
                    className="text-[10px] font-black uppercase text-[var(--purple)] border-b border-[var(--purple)]"
                  >
                    Como validar meu artista?
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {artists.map((artist, idx) => (
                    <motion.div 
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleArtistClick(artist)}
                      className="glass-card p-4 flex items-center gap-4 cursor-pointer"
                    >
                      <img 
                        src={artist.foto || 'https://via.placeholder.com/150'} 
                        alt={artist.nome} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-[var(--purple)]"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold">{artist.nome}</h3>
                        <p className="text-xs text-[var(--gold)] font-bold">{formatCurrency(artist.saldo)}</p>
                      </div>
                      <div className="text-[10px] uppercase font-bold opacity-30">Saber Mais</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {screen === 'dashboard' && selectedArtist && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                   <img 
                    src={selectedArtist.foto} 
                    alt={selectedArtist.nome} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#08010f] relative z-10 mx-auto"
                   />
                   <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] animate-spin-slow opacity-50 shadow-[0_0_20px_rgba(188,19,254,0.3)]"></div>
                </div>
                <div>
                  <h2 className="bebas text-4xl tracking-widest mb-1">{selectedArtist.nome}</h2>
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", selectedArtist.status === "Livre" ? "bg-[var(--green)]" : "bg-[var(--red)]")}></div>
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                      {selectedArtist.status === "Livre" ? "Disponível" : selectedArtist.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 text-center shadow-xl shadow-[var(--purple)]/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-20"></div>
                <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-1">Empire Coins (Saldo)</p>
                <h3 className="text-3xl font-black text-[var(--gold)]">{formatCurrency(selectedArtist.saldo)}</h3>
                <div className="mt-2 pt-2 border-t border-white/5">
                   <p className="text-[9px] opacity-30 uppercase font-bold tracking-widest">Fortuna Acumulada: <span className="text-white/60">{formatCurrency(selectedArtist.fortunaTotal)}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 text-center">
                  <p className="text-[10px] opacity-40 uppercase mb-1">Prestígio</p>
                  <p className="text-lg font-bold text-[var(--purple)]">{selectedArtist.prestigio}/1000</p>
                  <div className="h-1 bg-[var(--surface2)] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[var(--purple)]" style={{ width: `${(selectedArtist.prestigio / 1000) * 100}%` }}></div>
                   </div>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-[10px] opacity-40 uppercase mb-1">Fadiga</p>
                  <p className="text-lg font-bold text-[var(--red)]">{selectedArtist.fadiga}%</p>
                  <div className="h-1 bg-[var(--surface2)] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[var(--red)]" style={{ width: `${selectedArtist.fadiga}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-4 glass-card cursor-pointer border-b-2 border-b-[var(--purple)]" onClick={() => setScreen('mgmt')}>
                   <Rocket className="text-[var(--purple)]" />
                   <span className="text-[10px] font-bold uppercase">Gestão</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 glass-card cursor-pointer" onClick={() => setScreen('market')}>
                   <Store className="text-[var(--gold)]" />
                   <span className="text-[10px] font-bold uppercase">Mercado</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 glass-card cursor-pointer" onClick={() => setScreen('tutorial')}>
                   <Info className="text-[var(--neon)]" />
                   <span className="text-[10px] font-bold uppercase">Ajuda</span>
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  onClick={() => {
                    setScreen('bater-ponto');
                    safeHaptic(() => hapticFeedback.impactOccurred('medium'));
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--purple2)] to-[var(--purple)] text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                 >
                   <Zap size={20} />
                   Bater o Ponto
                 </button>
              </div>
            </motion.div>
          )}

          {screen === 'bater-ponto' && selectedArtist && (
             <motion.div
                key="bater-ponto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
             >
                <div className="text-center">
                   <h2 className="bebas text-3xl tracking-widest mb-1">BATER O PONTO</h2>
                   <p className="text-xs opacity-40 uppercase tracking-widest">Selecione a atividade realizada hoje</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'comentarios', icon: <MessageSquare size={20} />, label: "Comentários", desc: "Redes sociais, Portais, Fanbase", color: "var(--purple)" },
                    { id: 'videos', icon: <Film size={20} />, label: "Vídeos/Clipes", desc: "YouTube, TikTok, Reels", color: "var(--neon)" },
                    { id: 'shows', icon: <Music size={20} />, label: "Shows/Lives", desc: "Eventos, Rádio, Streamings", color: "var(--gold)" },
                    { id: 'imprensa', icon: <Info size={20} />, label: "Imprensa", desc: "Matérias, Entrevistas, Blogs", color: "var(--green)" },
                  ].map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => {
                        setActionCategory(cat.id);
                        safeHaptic(() => hapticFeedback.impactOccurred('light'));
                      }}
                      className={cn(
                        "glass-card p-4 flex items-center gap-4 cursor-pointer border-2 transition-all relative overflow-hidden",
                        actionCategory === cat.id ? "border-[var(--purple)] bg-[var(--purple)]/10" : "border-transparent"
                      )}
                    >
                      {actionCategory === cat.id && (
                        <motion.div 
                          layoutId="active-bg" 
                          className="absolute inset-0 bg-gradient-to-r from-[var(--purple)]/5 to-transparent z-0" 
                        />
                      )}
                      <div className={cn("p-3 rounded-xl z-10", actionCategory === cat.id ? "bg-[var(--purple)] text-white" : "bg-[var(--surface2)] opacity-60")}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 z-10">
                        <h4 className="font-bold text-sm tracking-tight">{cat.label}</h4>
                        <p className="text-[10px] opacity-40 uppercase font-medium">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading}
                    onClick={handleActionSubmit}
                    className="w-full py-4 rounded-full bg-white text-black font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processando...' : 'Confirmar Registro'}
                  </button>
                </div>
             </motion.div>
          )}

          {screen === 'mgmt' && (
             <motion.div
                key="mgmt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
             >
                {!selectedArtist ? (
                  <div className="text-center py-20 p-6 glass-card border-dashed border-2 border-[var(--border)]">
                    <Rocket size={40} className="mx-auto mb-4 opacity-20" />
                    <h3 className="bebas text-2xl tracking-widest mb-2">SALA DE COMANDO</h3>
                    <p className="text-xs opacity-50 mb-6">Selecione um artista na aba "Artistas" para gerenciar sua carreira.</p>
                    <button 
                      onClick={() => setScreen('artists')}
                      className="px-8 py-3 rounded-full bg-[var(--purple)] text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                      Ver Artistas
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="bebas text-3xl tracking-widest">MINHA VILA</h2>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">Gestão de {selectedArtist.nome}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                        <Rocket size={20} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="bebas text-xl tracking-widest opacity-60">Projetos Ativos</h3>
                      {selectedArtist.tour_info && selectedArtist.tour_info.nomeTour ? (
                        <div className="glass-card p-6 border-l-4 border-l-[var(--gold)] relative overflow-hidden">
                           <div className="absolute top-[-10px] right-[-10px] opacity-5">
                             <Music size={80} />
                           </div>
                           <span className="text-[10px] font-bold py-1 px-3 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] uppercase border border-[var(--gold)]/20">🎤 Tour Ativa</span>
                           <h3 className="bebas text-2xl tracking-widest mt-4 mb-2">{selectedArtist.tour_info.nomeTour}</h3>
                           <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
                                <div>
                                    <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Arrecadação</span>
                                    <span className="font-bold text-[var(--gold)]">{formatCurrency(selectedArtist.tour_info.arrecadacao || 0)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Progresso</span>
                                    <span className="font-bold uppercase text-[var(--gold)]">Show {selectedArtist.tour_info.showAtual || 0}/{selectedArtist.tour_info.totalShows || 0}</span>
                                </div>
                           </div>
                        </div>
                      ) : (
                        <div className="glass-card p-10 text-center opacity-30 border-dashed border-2 border-[var(--border)]">
                          <p className="text-xs uppercase font-bold tracking-widest">Nenhum projeto em andamento</p>
                          <p className="text-[10px] mt-2">Clique em um dos botões abaixo para começar</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <button 
                        onClick={() => handleStartProject('tour')}
                        className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left flex flex-col gap-3 active:scale-95 transition-transform"
                       >
                         <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                            <Music size={20} />
                         </div>
                         <div>
                            <span className="text-[10px] font-bold uppercase block tracking-tight">Lançar Tour</span>
                            <p className="text-[8px] opacity-40 uppercase font-medium">Geração de saldo</p>
                         </div>
                       </button>
                       <button 
                        onClick={() => handleStartProject('cinema')}
                        className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left flex flex-col gap-3 active:scale-95 transition-transform"
                       >
                         <div className="w-10 h-10 rounded-xl bg-[var(--neon)]/10 flex items-center justify-center text-[var(--neon)]">
                            <Film size={20} />
                         </div>
                         <div>
                            <span className="text-[10px] font-bold uppercase block tracking-tight">Cinema</span>
                            <p className="text-[8px] opacity-40 uppercase font-medium">Geração de prestígio</p>
                         </div>
                       </button>
                    </div>
                  </>
                )}
             </motion.div>
          )}

          {screen === 'charts' && (
             <motion.div
               key="charts"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="mb-6">
                  <h2 className="bebas text-3xl tracking-widest text-center">RANKING GLOBAL</h2>
                  <p className="text-[10px] text-center opacity-40 uppercase tracking-[0.3em]">Os maiores Gestores da Empire</p>
                </div>

                {loading && artists.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 rounded-xl bg-[var(--surface)] animate-pulse" />)}
                  </div>
                ) : artists.length === 0 ? (
                   <div className="text-center py-20 opacity-30">
                      <Globe size={40} className="mx-auto mb-4" />
                      <p className="text-xs uppercase font-bold">Nenhum artista no ranking ainda</p>
                   </div>
                ) : (
                  <div className="space-y-2">
                    {artists.sort((a, b) => b.prestigio - a.prestigio).map((art, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "glass-card p-3 flex items-center gap-4 border-l-4",
                          idx === 0 ? "border-l-[var(--gold)] bg-[var(--gold)]/5" : "border-l-transparent"
                        )}
                      >
                        <div className="bebas text-2xl opacity-20 w-6 text-center">{idx + 1}</div>
                        <img src={art.foto || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full border border-[var(--border)] object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm tracking-tight">{art.nome}</h4>
                          <div className="h-1 bg-[var(--surface2)] w-20 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-[var(--purple)]" style={{ width: `${Math.min((art.prestigio / 1000) * 100, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-[var(--gold)]">{art.prestigio} <span className="opacity-40 font-bold ml-1">pts</span></p>
                          <p className="text-[8px] opacity-30 uppercase font-bold">Prestígio</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </motion.div>
          )}

          {screen === 'market' && (
             <motion.div key="market" className="space-y-6">
                 <div className="text-center">
                    <h2 className="bebas text-3xl tracking-widest text-center">EMPIRE MARKET</h2>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Investimentos e Expansão</p>
                 </div>
                 
                 <div className="pb-10">
                   {[
                     { t: "Estúdio de Gravação", d: "Aumenta a qualidade dos registros diários em 15%", price: "50,000", icon: <Mic2 className="text-[var(--gold)]" /> },
                     { t: "Assessoria de Imprensa", d: "Reduz a perda de prestígio semanal", price: "75,000", icon: <Info className="text-[var(--neon)]" /> },
                     { t: "Jato Particular", d: "Reduz a fadiga de tour em 20%", price: "500,000", icon: <Zap className="text-[var(--green)]" /> }
                   ].map((item, i) => (
                     <div key={i} className="glass-card p-5 mb-3 flex items-center gap-5 opacity-30 grayscale relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.t}</h4>
                          <p className="text-[10px] opacity-60 leading-tight">{item.d}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-[var(--gold)]">EC {item.price}</p>
                          <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white font-bold uppercase">Breve</span>
                        </div>
                     </div>
                   ))}
                 </div>

                 <div className="glass-card p-10 text-center border-dashed border-2 border-[var(--border)] opacity-20">
                    <Trophy size={40} className="mx-auto mb-4" />
                    <p className="text-xs uppercase font-black">Módulo de Expansão em Desenvolvimento</p>
                 </div>
             </motion.div>
          )}

          {screen === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
               <h2 className="bebas text-3xl tracking-widest">COMO CRESCER</h2>
               <div className="space-y-6">
                 {[
                   { t: "1. Bater o Ponto", d: "Registre o que fez pelo seu artista: comentários, vídeos, performances. Cada tipo vale pontos exclusivos." },
                   { t: "2. Distribuir Pontos", d: "Com os pontos ganhos, você decide como distribuí-los entre os charts (Billboard, Spotify, etc)." },
                   { t: "3. eCoin + Investimento", d: "Invista seu saldo em playlists estratégicas para impulsionar a audiência do seu artista." }
                 ].map((step, idx) => (
                   <div key={idx} className="flex gap-5">
                      <div className="w-12 h-12 rounded-full bg-[var(--purple)]/20 border border-[var(--purple)]/40 flex items-center justify-center bebas text-xl text-[var(--purple)] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm tracking-wide">{step.t}</h4>
                        <p className="text-xs opacity-50 leading-relaxed">{step.d}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-4 pb-10 bg-[#08010f]/80 backdrop-blur-xl border-t border-[var(--border)] relative z-20">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <NavButton active={screen === 'home'} onClick={() => setScreen('home')} icon={<Sparkles size={20} />} label="Hub" />
          <NavButton active={screen === 'artists'} onClick={() => setScreen('artists')} icon={<Music size={20} />} label="Artistas" />
          <NavButton active={screen === 'charts'} onClick={() => setScreen('charts')} icon={<Trophy size={20} />} label="Ranking" />
          <NavButton active={screen === 'mgmt'} onClick={() => setScreen('mgmt')} icon={<Rocket size={20} />} label="Vila" />
          <Settings onClick={() => safeHaptic(() => hapticFeedback.impactOccurred('medium'))} className="opacity-40 cursor-pointer active:scale-95" size={20} />
        </div>
      </footer>
    </div>
  );
}
