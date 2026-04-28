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
  Music, Film, Trophy, LayoutGrid, Info
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
  const lp = useLaunchParams();
  const [screen, setScreen] = useState<'home' | 'artists' | 'dashboard' | 'mgmt' | 'tutorial'>('home');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);

  const user = lp.initData?.user;
  const tgId = user?.id || "000000";

  useEffect(() => {
    if (screen === 'artists') {
      loadArtists();
    }
  }, [screen]);

  const loadArtists = async () => {
    setLoading(true);
    const data = await apiService.getArtistsByTg(tgId);
    setArtists(data);
    setLoading(false);
  };

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setScreen('dashboard');
    hapticFeedback.impactOccurred('light');
  };

  const navigateBack = () => {
    if (screen === 'dashboard') setScreen('artists');
    else if (screen === 'mgmt') setScreen('dashboard');
    else setScreen('home');
    hapticFeedback.impactOccurred('light');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val).replace('R$', '$EC');
  };

  return (
    <div className="min-h-screen bg-[#08010f] text-[#f0e8ff] flex flex-col overflow-hidden relative">
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
                 {user.firstName.charAt(0)}
               </div>
               <span className="text-[10px] font-bold opacity-70">{user.username || user.firstName}</span>
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
              <div className="text-center py-8">
                <h1 className="bebas text-5xl tracking-widest mb-1">EMPIRE HUB</h1>
                <p className="text-xs opacity-40 uppercase tracking-[0.2em]">Music & Entertainment</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div 
                  onClick={() => setScreen('artists')}
                  className="glass-card p-5 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[var(--purple)]/10 border border-[var(--purple)]/20 flex items-center justify-center text-[var(--purple)]">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Meus Artistas</h3>
                    <p className="text-xs opacity-40">Portfólio, finanças e agenda</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-center gap-5 opacity-50">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center text-[var(--neon)]">
                    <Globe size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Radar Empire</h3>
                    <p className="text-xs opacity-40">O que os artistas estão fazendo</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-center gap-5 opacity-50">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--green)]/10 border border-[var(--green)]/20 flex items-center justify-center text-[var(--green)]">
                    <LayoutGrid size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Charts</h3>
                    <p className="text-xs opacity-40">Billboard, Spotify e mais</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 text-center space-y-4">
                <h4 className="bebas text-xl tracking-wider text-[var(--gold)]">Tutorial</h4>
                <p className="text-sm opacity-60 leading-relaxed">
                  Você é um manager de artistas no simulador musical mais épico do Telegram. 
                  Gerencie carreiras, investimentos e conquistas.
                </p>
                <button 
                  onClick={() => setScreen('tutorial')}
                  className="px-6 py-2 rounded-full border border-[var(--gold)] text-[var(--gold)] text-xs font-bold uppercase tracking-widest"
                >
                  Saiba Mais
                </button>
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
                <div className="text-center py-20 opacity-30">
                  <p>Você não gerencia nenhum artista ainda.</p>
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

              <div className="glass-card p-6 text-center shadow-xl shadow-[var(--purple)]/5">
                <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-1">Empire Coins</p>
                <h3 className="text-3xl font-black text-[var(--gold)]">{formatCurrency(selectedArtist.saldo)}</h3>
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
                <div className="flex flex-col items-center gap-2 p-4 glass-card cursor-pointer" onClick={() => setScreen('mgmt')}>
                   <LayoutGrid className="text-[var(--purple)]" />
                   <span className="text-[10px] font-bold uppercase">Gestão</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 glass-card opacity-50 cursor-pointer">
                   <Settings className="text-[var(--gold)]" />
                   <span className="text-[10px] font-bold uppercase">Ajustes</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 glass-card opacity-50 cursor-pointer">
                   <Info className="text-[var(--neon)]" />
                   <span className="text-[10px] font-bold uppercase">Info</span>
                </div>
              </div>

              <div className="pt-4">
                 <button 
                  onClick={() => hapticFeedback.notificationOccurred('success')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--purple2)] to-[var(--purple)] text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform"
                 >
                   Coletar Recompensa Diária
                 </button>
              </div>
            </motion.div>
          )}

          {screen === 'mgmt' && selectedArtist && (
             <motion.div
                key="mgmt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
             >
                <div className="mb-6">
                  <h2 className="bebas text-3xl tracking-widest">Gestão Proativa</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Projetos Ativos de {selectedArtist.nome}</p>
                </div>

                <div className="space-y-4">
                  {selectedArtist.tour_info ? (
                    <div className="glass-card p-6 border-l-4 border-l-[var(--gold)]">
                       <span className="text-[10px] font-bold py-1 px-3 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] uppercase border border-[var(--gold)]/20">🎤 Tour Ativa</span>
                       <h3 className="bebas text-2xl tracking-widest mt-4 mb-2">{selectedArtist.tour_info.nomeTour}</h3>
                       <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
                          <div>
                            <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Arrecadação</span>
                            <span className="font-bold text-[var(--gold)]">{formatCurrency(selectedArtist.tour_info.arrecadacao)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Progresso</span>
                            <span className="font-bold uppercase text-[var(--gold)]">Show {selectedArtist.tour_info.showAtual}/{selectedArtist.tour_info.totalShows}</span>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 opacity-30">
                      <p>Nenhum projeto ativo.</p>
                    </div>
                  )}
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
               <h2 className="bebas text-3xl tracking-widest">Como Jogar</h2>
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

      {/* Footer Nav */}
      <footer className="p-4 pb-10 bg-[#08010f]/80 backdrop-blur-xl border-t border-[var(--border)] relative z-20">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <NavButton active={screen === 'home'} onClick={() => setScreen('home')} icon={<Sparkles size={20} />} label="Início" />
          <NavButton active={screen === 'artists'} onClick={() => setScreen('artists')} icon={<Music size={20} />} label="Artistas" />
          <NavButton active={screen === 'dashboard'} onClick={() => setScreen('dashboard')} icon={<LayoutGrid size={20} />} label="Dash" />
          <NavButton active={screen === 'mgmt'} onClick={() => setScreen('mgmt')} icon={<Rocket size={20} />} label="Vila" />
          <Settings onClick={() => hapticFeedback.impactOccurred('medium')} className="opacity-40 cursor-pointer active:scale-95" size={20} />
        </div>
      </footer>
    </div>
  );
}
