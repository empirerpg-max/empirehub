/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Wallet, Sparkles, MessageSquare, Bell, 
  Settings, Rocket, Zap, ChevronLeft, Globe, 
  Music, Film, Trophy, LayoutGrid, Info, Mic2, Store,
  AlertTriangle, RefreshCw, X, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [tgId, setTgId] = useState<string>("000000");
  const [screen, setScreen] = useState<'home' | 'artists' | 'dashboard' | 'mgmt' | 'tutorial' | 'charts' | 'market' | 'feed' | 'labels' | 'duel' | 'hub' | 'finished-projects' | 'ranking' | 'bet'>('home');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<{
    show: boolean;
    type: 'tour' | 'cinema' | null;
    data: any;
  }>({ show: false, type: null, data: {} });
  const [radarItems, setRadarItems] = useState<any[]>([]);
  const [globalArtists, setAllArtists] = useState<Artist[]>([]);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [finishedProjects, setFinishedProjects] = useState<any[]>([]);
  const [betMusics, setBetMusics] = useState<any[]>([]);
  const [betForm, setBetForm] = useState({ valor: '1000', semana: '', previsoEs: '' });

  // Labels Data
  const labels = [
    { name: "King & Queen", totalAcquired: 12500000, artists: ["Empire Star", "Queen B"] },
    { name: "Crown", totalAcquired: 8400000, artists: ["Prince of Pop"] },
    { name: "Independent", totalAcquired: 2100000, artists: ["Indie Soul"] }
  ];

  // Feed Data (Mock)
  const feedItems = [
    { user: "João", action: "contratou uma Tour Nacional", artist: "Empire Star", time: "2m" },
    { user: "Maria", action: "comprou um Apartamento em NY", artist: "Prince of Pop", time: "5m" },
    { user: "Pedro", action: "viralizou uma música", artist: "Indie Soul", time: "12m" },
  ];

  useEffect(() => {
    const initializeApp = () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          if (tg.headerColor) tg.setHeaderColor('#08010f');
          if (tg.backgroundColor) tg.setBackgroundColor('#08010f');
          
          if (tg.initDataUnsafe?.user) {
            const u = tg.initDataUnsafe.user;
            setUser(u);
            setTgId(u.id.toString());
          }
        }

        // Fallback or Test Mode
        const params = new URLSearchParams(window.location.search);
        const testId = params.get('tg_id') || params.get('userId') || params.get('id');
        
        if (testId) {
          setTgId(testId);
          setUser({ first_name: "Usuário", id: testId });
        } else if (!tg?.initDataUnsafe?.user) {
          setTgId("123456");
          setUser({ first_name: "Visitante", last_name: "Preview", id: "123456" });
        }
      } catch (e) {
        console.error("Initialization error:", e);
        setTgId("123456");
        setUser({ first_name: "Error User", id: "123456" });
      }
      setSdkReady(true);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (tgId !== "000000" && sdkReady) {
      loadArtists();
    }
  }, [tgId, sdkReady]);

  useEffect(() => {
    if (screen === 'feed') {
      apiService.getRadar().then(setRadarItems);
    } else if (screen === 'charts' || screen === 'labels' || screen === 'ranking') {
      apiService.getAllArtists().then(setAllArtists);
    } else if (screen === 'mgmt' && selectedArtist) {
      apiService.getProjects(selectedArtist.nome).then(projects => {
        setActiveProjects(projects.filter((p: any) => p.status !== 'Finalizado'));
      });
    } else if (screen === 'finished-projects' && selectedArtist) {
      apiService.getProjects(selectedArtist.nome).then(projects => {
        setFinishedProjects(projects.filter((p: any) => p.status === 'Finalizado'));
      });
    } else if (screen === 'bet') {
      apiService.getBetMusics().then(data => {
        if (data && !data.erro) setBetMusics(Array.isArray(data) ? data : []);
      });
    }
  }, [screen, selectedArtist]);

  const loadArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tgId === "000000") {
        setError("Não foi possível identificar seu ID do Telegram. Certifique-se de que está acessando via Telegram.");
        setLoading(false);
        return;
      }

      const data = await apiService.getArtistsByTg(tgId);
      setArtists(data);
      
      if (data.length === 1 && !selectedArtist) {
        setSelectedArtist(data[0]);
        setScreen('dashboard');
      }

      if (selectedArtist) {
        const updated = data.find(a => a.nome === selectedArtist.nome);
        if (updated) setSelectedArtist(updated);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async () => {
    if (!selectedArtist || !projectForm.type) return;
    
    setLoading(true);
    try {
      const resp = projectForm.type === 'tour' 
        ? await apiService.buyTour({
            nome: selectedArtist.nome,
            titulo: projectForm.data.titulo,
            tipo: projectForm.data.tipo,
            dataInicio: projectForm.data.dataInicio,
            qtd: parseInt(projectForm.data.qtd || "10"),
            continente: projectForm.data.continente
          })
        : await apiService.buyCinema({
            nome: selectedArtist.nome,
            titulo: projectForm.data.titulo,
            tipo: projectForm.data.tipo,
            genero: projectForm.data.genero,
            dataInicio: projectForm.data.dataInicio
          });
      
      const message = resp.message || (typeof resp === 'string' ? resp : "Operação finalizada.");
      
      if (resp.status === 'success' || (typeof resp === 'string' && !resp.toLowerCase().includes('erro') && !resp.includes('❌'))) {
        alert("✅ " + message);
        setProjectForm({ show: false, type: null, data: {} });
        setScreen('mgmt');
        loadArtists();
      } else {
        alert(message);
        console.error("Project Error Details:", resp);
        loadArtists(); // Refresh to sync balance if there was a mismatch
      }
    } catch (e) {
      alert("Falha na conexão.");
      loadArtists();
    } finally {
      setLoading(false);
    }
  };

  const handleBetSubmit = async () => {
    if (!selectedArtist) return;
    setLoading(true);
    try {
      const resp = await apiService.submitBet(
        selectedArtist.nome,
        betForm.valor,
        betForm.semana,
        betForm.previsoEs
      );
      alert(resp);
      if (!resp.toLowerCase().includes('erro') && !resp.includes('❌')) {
        setScreen('dashboard');
        loadArtists();
      }
    } catch (e) {
      alert("Erro ao enviar aposta.");
    }
    setLoading(false);
  };

  const safeHaptic = () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    } catch (e) {}
  };

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setScreen('dashboard');
    safeHaptic();
  };

  const navigateBack = () => {
    if (screen === 'dashboard') setScreen('artists');
    else if (screen === 'mgmt' || screen === 'hub' || screen === 'finished-projects') setScreen('dashboard');
    else if (['feed', 'labels', 'duel', 'charts', 'market', 'artists', 'tutorial'].includes(screen)) setScreen('home');
    else setScreen('home');
    safeHaptic();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val).replace('R$', '$EC');
  };

  const formatImageUrl = (url: string | undefined | null) => {
    if (!url) return '';
    
    // Handle Google Drive links (all common formats)
    if (url.includes('drive.google.com')) {
      let id = '';
      if (url.includes('/d/')) {
        const match = url.match(/\/d\/([^\/?]+)/);
        if (match) id = match[1];
      } else if (url.includes('id=')) {
        const match = url.match(/id=([^\/&?]+)/);
        if (match) id = match[1];
      }
      
      if (id) return `https://lh3.googleusercontent.com/d/${id}=s800`;
    }
    
    // Ensure https
    if (url.startsWith('http:')) return url.replace('http:', 'https:');
    
    return url;
  };

  const handleMarketClick = async (item: string, price: string) => {
    if (!selectedArtist) {
      alert("Selecione um artista primeiro!");
      return;
    }
    setLoading(true);
    safeHaptic();
    try {
      const res = await apiService.marketAction({
        nome: selectedArtist.nome,
        acao: item,
        valor: price
      });
      alert(`Solicitação de "${item}" enviada! Status: ${res.status || 'Processando'}`);
      await loadArtists();
    } catch (e) {
      console.error(e);
      alert("Erro ao processar compra no Market.");
    }
    setLoading(false);
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
      {/* Error State */}
      {error && (
        <div className="fixed inset-0 z-[110] bg-[#08010f]/95 backdrop-blur-md flex items-center justify-center p-6">
           <div className="glass-card p-6 text-center border-red-500/50">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="bebas text-2xl tracking-widest text-white mb-2">Ops! Algo deu errado</h3>
              <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest mb-6 leading-relaxed">
                {error}
              </p>
              <button 
                onClick={loadArtists}
                className="flex items-center gap-2 justify-center w-full py-3 rounded-full bg-[var(--purple)] text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                <RefreshCw size={14} /> Tentar Novamente
              </button>
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
          {projectForm.show && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] bg-[#08010f]/95 backdrop-blur-xl p-6 overflow-y-auto"
            >
               <button 
                onClick={() => setProjectForm({ show: false, type: null, data: {} })}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full"
               >
                 <X size={24} />
               </button>

               <div className="max-w-md mx-auto py-10 space-y-8">
                  <div className="text-center">
                    <h2 className="bebas text-4xl tracking-widest text-[var(--purple)]">
                      {projectForm.type === 'tour' ? 'CONTRATAR TOUR' : 'CINEMA & TV'}
                    </h2>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mt-2">
                       Preencha os detalhes para lançar o projeto
                    </p>
                  </div>

                  <div className="glass-card p-6 space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Título do Projeto</label>
                          <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                            placeholder="Ex: World Tour 2024"
                            value={projectForm.data.titulo || ''}
                            onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, titulo: e.target.value}})}
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Data de Início</label>
                          <input 
                            type="date" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                            value={projectForm.data.dataInicio || ''}
                            onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, dataInicio: e.target.value}})}
                          />
                       </div>

                       {projectForm.type === 'tour' ? (
                         <>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Quantidade de Datas</label>
                              <input 
                                type="number" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                                value={projectForm.data.qtd || ''}
                                onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, qtd: e.target.value}})}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Tipo de Local</label>
                              <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none appearance-none"
                                value={projectForm.data.tipo || ''}
                                onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, tipo: e.target.value}})}
                              >
                                 <option value="Clubs" className="bg-[#08010f]">Clubs/Casas de Show</option>
                                 <option value="Arenas" className="bg-[#08010f]">Arenas</option>
                                 <option value="Estádios" className="bg-[#08010f]">Estádios</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Continente Principal</label>
                              <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none appearance-none"
                                value={projectForm.data.continente || ''}
                                onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, continente: e.target.value}})}
                              >
                                 <option value="América do Sul" className="bg-[#08010f]">América do Sul</option>
                                 <option value="América do Norte" className="bg-[#08010f]">América do Norte</option>
                                 <option value="Europa" className="bg-[#08010f]">Europa</option>
                                 <option value="Ásia" className="bg-[#08010f]">Ásia</option>
                                 <option value="Mundial" className="bg-[#08010f]">Mundial</option>
                              </select>
                           </div>
                         </>
                       ) : (
                         <>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Tipo de Produção</label>
                              <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none appearance-none"
                                value={projectForm.data.tipo || ''}
                                onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, tipo: e.target.value}})}
                              >
                                 <option value="Filme" className="bg-[#08010f]">Filme</option>
                                 <option value="Série" className="bg-[#08010f]">Série</option>
                                 <option value="Reality" className="bg-[#08010f]">Reality Show</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Gênero</label>
                              <input 
                                type="text" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                                placeholder="Ex: Drama, Musical, Ação"
                                value={projectForm.data.genero || ''}
                                onChange={(e) => setProjectForm({...projectForm, data: {...projectForm.data, genero: e.target.value}})}
                              />
                           </div>
                         </>
                       )}
                    </div>

                    <button 
                      onClick={handleStartProject}
                      disabled={loading || !projectForm.data.titulo || !projectForm.data.dataInicio}
                      className="w-full py-4 rounded-xl bg-[var(--purple)] text-white bebas text-xl tracking-widest shadow-lg shadow-[var(--purple)]/20 active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loading ? 'Processando...' : 'Lançar Projeto'}
                    </button>
                  </div>
               </div>
            </motion.div>
          )}

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
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--purple)] bg-white/5">
                    <img 
                      src={formatImageUrl(selectedArtist.foto)} 
                      onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Empire')}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] uppercase font-bold opacity-40 tracking-widest">Artista Ativo</p>
                    <h4 className="font-bold text-sm tracking-tight">{selectedArtist.nome}</h4>
                    <p className="text-[10px] font-black text-[var(--gold)]">{formatCurrency(selectedArtist.saldo)}</p>
                  </div>
                  <Rocket size={18} className="text-[var(--purple)] animate-bounce-slow" />
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {/* O que os artistas estão fazendo */}
                <div 
                  onClick={() => setScreen('feed')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--purple)]/10 border border-[var(--purple)]/20 flex items-center justify-center text-[var(--purple)] group-hover:bg-[var(--purple)] group-hover:text-white transition-colors">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">O que os artistas estão fazendo</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Atividade em Tempo Real</p>
                  </div>
                </div>

                {/* Tutorial */}
                <div 
                  onClick={() => setScreen('tutorial')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center text-[var(--neon)] group-hover:bg-[var(--neon)] group-hover:text-black transition-colors">
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Tutorial</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">aprenda a usar</p>
                  </div>
                </div>

                {/* Seu Artista (Meus Artistas) */}
                <div 
                  onClick={() => setScreen('artists')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors">
                    <Music size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Seu Artista</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Gestão, Projetos e Hub</p>
                  </div>
                </div>

                {/* Gravadoras */}
                <div 
                  onClick={() => setScreen('labels')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--purple2)]/10 border border-[var(--purple2)]/20 flex items-center justify-center text-[var(--purple2)] group-hover:bg-[var(--purple2)] group-hover:text-white transition-colors">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Gravadoras</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Selo e Contratos</p>
                  </div>
                </div>

                {/* Duelo */}
                <div 
                  onClick={() => setScreen('duel')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-center justify-center text-[var(--red)] group-hover:bg-[var(--red)] group-hover:text-white transition-colors">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Duelo</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Minigame de Charts</p>
                  </div>
                </div>

                {/* Ranking Global */}
                <div 
                  onClick={() => setScreen('ranking')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-colors">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Ranking Global</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Líderes de Prestígio</p>
                  </div>
                </div>

                {/* Charts */}
                <div 
                  onClick={() => setScreen('charts')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--purple)]/10 border border-[var(--purple)]/20 flex items-center justify-center text-[var(--purple)] group-hover:bg-[var(--purple)] group-hover:text-white transition-colors">
                    <Music size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Charts Musicais</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Billboard, Spotify e mais</p>
                  </div>
                </div>

                {/* Empire Market */}
                <div 
                  onClick={() => setScreen('market')}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--green)]/10 border border-[var(--green)]/20 flex items-center justify-center text-[var(--green)] group-hover:bg-[var(--green)] group-hover:text-black transition-colors">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Empire Market</h3>
                    <p className="text-[10px] opacity-40 uppercase font-medium">Investimentos Oficiais</p>
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
                   Distribua pontos, invista em playlists e contrate tours para crescer seu império.
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
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--purple)] bg-white/5">
                        <img 
                          src={formatImageUrl(artist.foto)} 
                          alt={artist.nome} 
                          onError={(e) => (e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.nome}`)}
                          className="w-full h-full object-cover"
                        />
                      </div>
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
                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#08010f] relative z-10 mx-auto bg-white/5">
                     <img 
                      src={formatImageUrl(selectedArtist.foto)} 
                      alt={selectedArtist.nome} 
                      onError={(e) => (e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedArtist.nome}`)}
                      className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] animate-spin-slow opacity-50 shadow-[0_0_20px_rgba(188,19,254,0.3)]"></div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-center">
                    <h2 className="bebas text-4xl tracking-widest mb-1">{selectedArtist.nome}</h2>
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", selectedArtist.status === "Livre" ? "bg-[var(--green)]" : "bg-[var(--red)]")}></div>
                      <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                        {selectedArtist.status === "Livre" ? "Disponível" : selectedArtist.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={loadArtists}
                    disabled={loading}
                    className="p-3 rounded-full bg-white/5 border border-white/10 active:rotate-180 transition-transform duration-500"
                  >
                    <RefreshCw size={20} className={cn(loading && "animate-spin")} />
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 text-center shadow-xl shadow-[var(--purple)]/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-20"></div>
                <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] mb-1">Empire Coins (Saldo)</p>
                <h3 className="text-3xl font-black text-[var(--gold)]">{formatCurrency(selectedArtist.saldo)}</h3>
                <div className="mt-2 pt-2 border-t border-white/5">
                   <p className="text-[9px] opacity-30 uppercase font-bold tracking-widest">Fortuna Acumulada: <span className="text-white/60">{formatCurrency(selectedArtist.fortuna_total || selectedArtist.fortunaTotal || 0)}</span></p>
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
                <div 
                  className={cn("flex flex-col items-center gap-2 p-4 glass-card cursor-pointer transition-all", screen === 'hub' ? "border-b-2 border-b-[var(--purple)]" : "")} 
                  onClick={() => setScreen('hub')}
                >
                   <Rocket className={cn(screen === 'hub' ? "text-[var(--purple)]" : "opacity-40")} />
                   <span className="text-[9px] font-bold uppercase text-center leading-tight">Empire Hub</span>
                </div>
                <div 
                  className={cn("flex flex-col items-center gap-2 p-4 glass-card cursor-pointer transition-all", screen === 'mgmt' ? "border-b-2 border-b-[var(--purple)]" : "")} 
                  onClick={() => setScreen('mgmt')}
                >
                   <LayoutGrid className={cn(screen === 'mgmt' ? "text-[var(--purple)]" : "opacity-40")} />
                   <span className="text-[9px] font-bold uppercase text-center leading-tight">Gestão de Projetos</span>
                </div>
                <div 
                  className={cn("flex flex-col items-center gap-2 p-4 glass-card cursor-pointer transition-all", screen === 'finished-projects' ? "border-b-2 border-b-[var(--purple)]" : "")} 
                  onClick={() => setScreen('finished-projects')}
                >
                   <Trophy className={cn(screen === 'finished-projects' ? "text-[var(--purple)]" : "opacity-40")} />
                   <span className="text-[9px] font-bold uppercase text-center leading-tight">Projetos Finalizados</span>
                </div>
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
                      {activeProjects.length > 0 ? (
                        activeProjects.map((proj, pIdx) => (
                          <div key={pIdx} className="glass-card p-6 border-l-4 border-l-[var(--gold)] relative overflow-hidden">
                             <div className="absolute top-[-10px] right-[-10px] opacity-5">
                               {proj.tipo === 'cinema' ? <Film size={80} /> : <Music size={80} />}
                             </div>
                             <span className="text-[10px] font-bold py-1 px-3 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] uppercase border border-[var(--gold)]/20">
                               🎤 {proj.categoria || 'Projeto'} Ativo
                             </span>
                             <h3 className="bebas text-2xl tracking-widest mt-4 mb-2">{proj.titulo}</h3>
                             <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
                                  <div>
                                      <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Previsão</span>
                                      <span className="font-bold text-[var(--gold)]">{proj.data_inicio || 'N/A'}</span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] opacity-40 uppercase block mb-1 tracking-widest">Total</span>
                                      <span className="font-bold uppercase text-[var(--gold)]">{proj.status}</span>
                                  </div>
                             </div>
                          </div>
                        ))
                      ) : selectedArtist.tour_info && selectedArtist.tour_info.nomeTour ? (
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
                        onClick={() => setProjectForm({ show: true, type: 'tour', data: { titulo: '', dataInicio: '', qtd: '10', continente: 'América do Sul', tipo: 'Arenas' } })}
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
                        onClick={() => setProjectForm({ show: true, type: 'cinema', data: { titulo: '', tipo: 'Série', genero: 'Musical', dataInicio: '' } })}
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
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">CHARTS MUSICAIS</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Desempenho da Semana</p>
                </div>

                <div className="glass-card p-10 text-center opacity-30 border-dashed border-2 border-[var(--border)]">
                   <Music size={40} className="mx-auto mb-4" />
                   <p className="text-xs uppercase font-bold tracking-widest">Dados dos Charts vindo do Google Sheets</p>
                   <p className="text-[10px] mt-2">Billboard Hot 100, Spotify Global e Airplay</p>
                </div>
                
                <div className="text-center py-4">
                  <button 
                    onClick={() => window.open('https://docs.google.com/spreadsheets/d/1ThRhljmAS41JmVBPkPtYwe0JQHRx9Pih2PQAPT2ebyA/edit', '_blank')}
                    className="text-[10px] font-black uppercase text-[var(--purple)] border-b border-[var(--purple)]"
                  >
                    Ver Planilha Oficial de Charts
                  </button>
                </div>
             </motion.div>
          )}

          {screen === 'feed' && (
             <motion.div
               key="feed"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">FEED EM REAL TIME</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">O que os artistas estão fazendo</p>
                </div>

                <div className="space-y-3">
                  {radarItems.length > 0 ? (
                    radarItems.map((item, idx) => (
                      <div key={idx} className="glass-card p-4 border-l-2 border-l-[var(--purple)]">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black text-white">{item.user || 'Anônimo'}</span>
                          <span className="text-[8px] opacity-30 font-bold uppercase">{item.time || ''}</span>
                        </div>
                        <p className="text-xs opacity-70">
                          {item.action} para <span className="text-[var(--gold)] font-bold">{item.artist}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 opacity-20">
                       <RefreshCw size={24} className="mx-auto mb-2 animate-spin-slow" />
                       <p className="text-xs uppercase font-bold">Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center py-10 opacity-30">
                  <RefreshCw size={24} className="mx-auto mb-2 animate-spin-slow" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">Atualizando Feed...</p>
                </div>
             </motion.div>
          )}

          {screen === 'labels' && (
             <motion.div
               key="labels"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">GRAVADORAS</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Market Share & Artistas</p>
                </div>

                <div className="space-y-4">
                  {["King & Queen", "Crown", "Independent"].map((labelName, idx) => {
                    const labelArtists = globalArtists.filter(a => a.gravadora === labelName);
                    return (
                      <div key={idx} className="glass-card p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Music size={40} />
                        </div>
                        <h3 className="bebas text-2xl tracking-widest text-white mb-1 uppercase">{labelName}</h3>
                        <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-4">
                          Market Share: <span className="text-[var(--gold)]">{labelArtists.length} Artista(s)</span>
                        </p>
                        
                        <div className="pt-3 border-t border-white/5">
                          <p className="text-[9px] opacity-30 uppercase font-black tracking-widest mb-2">Artistas no Selo</p>
                          <div className="flex flex-wrap gap-2">
                            {labelArtists.length > 0 ? labelArtists.map((art, aIdx) => (
                              <span key={aIdx} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/50">{art.nome}</span>
                            )) : <span className="text-[9px] opacity-20 italic">Vazio</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </motion.div>
          )}

          {screen === 'duel' && (
             <motion.div
               key="duel"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">DUELO DE CHARTS</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Mini-game de combate</p>
                </div>

                <div className="glass-card p-6 flex flex-col gap-8 relative overflow-hidden">
                   {/* Background logic nodes */}
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] pointer-events-none"></div>
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="text-center space-y-2 flex-1">
                        <div className="w-16 h-16 rounded-full bg-[var(--purple)]/20 border-2 border-[var(--purple)] mx-auto flex items-center justify-center relative">
                          <User size={30} className="text-[var(--purple)]" />
                        </div>
                        <h4 className="bebas text-lg">MEU ARTISTA</h4>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-[var(--green)] w-[85%]"></div>
                        </div>
                      </div>

                      <div className="bebas text-4xl text-red-500 animate-pulse italic">VS</div>

                      <div className="text-center space-y-2 flex-1">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center">
                          <User size={30} className="text-red-500" />
                        </div>
                        <h4 className="bebas text-lg">DESAFIANTE</h4>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-red-500 w-[60%]"></div>
                        </div>
                      </div>
                   </div>

                   <div className="bg-black/40 rounded-xl p-4 border border-white/5 relative z-10">
                      <p className="text-[10px] opacity-50 uppercase font-bold text-center mb-2 tracking-widest">Log de Combate</p>
                      <div className="space-y-1 text-[10px] font-mono leading-tight">
                         <p className="text-[var(--green)]">&gt;&gt; Meu Artista usou "Billboard Hot 100"!</p>
                         <p className="text-red-400">&gt;&gt; Desafiante recebeu 250 de dano.</p>
                         <p className="text-white/40">&gt;&gt; Desafiante está preparando "Spotify Global"...</p>
                      </div>
                   </div>

                   <button className="w-full py-4 rounded-xl bg-red-600 text-white bebas text-2xl tracking-[0.2em] shadow-lg shadow-red-600/20 active:scale-95 transition-transform uppercase">
                      Lutar Agora
                   </button>
                </div>

                <div className="text-center opacity-30 px-6">
                   <p className="text-[9px] uppercase font-bold tracking-widest leading-relaxed">
                     O duelo é baseado no desempenho orgânico e investimentos da semana. O vencedor ganha prestígio extra.
                   </p>
                </div>
             </motion.div>
          )}

          {screen === 'ranking' && (
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

                {loading && globalArtists.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 rounded-xl bg-[var(--surface)] animate-pulse" />)}
                  </div>
                ) : globalArtists.length === 0 ? (
                   <div className="text-center py-20 opacity-30">
                      <Globe size={40} className="mx-auto mb-4" />
                      <p className="text-xs uppercase font-bold">Nenhum artista no ranking ainda</p>
                   </div>
                ) : (
                  <div className="space-y-2">
                    {[...globalArtists].sort((a, b) => b.prestigio - a.prestigio).map((art, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "glass-card p-3 flex items-center gap-4 border-l-4",
                          idx === 0 ? "border-l-[var(--gold)] bg-[var(--gold)]/5" : "border-l-transparent"
                        )}
                      >
                        <div className="bebas text-2xl opacity-20 w-6 text-center">{idx + 1}</div>
                        <img 
                          src={formatImageUrl(art.foto)} 
                          onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + art.nome)}
                          className="w-10 h-10 rounded-full border border-[var(--border)] object-cover" 
                        />
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

          {screen === 'charts' && (
             <motion.div
               key="charts"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">CHARTS MUSICAIS</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Desempenho da Semana</p>
                </div>

                <div className="glass-card p-10 text-center opacity-30 border-dashed border-2 border-[var(--border)]">
                   <Music size={40} className="mx-auto mb-4" />
                   <p className="text-xs uppercase font-bold tracking-widest">Dados dos Charts vindo do Google Sheets</p>
                   <p className="text-[10px] mt-2">Billboard Hot 100, Spotify Global e Airplay</p>
                </div>
                
                <div className="text-center py-4">
                  <button 
                    onClick={() => window.open('https://docs.google.com/spreadsheets/d/1ThRhljmAS41JmVBPkPtYwe0JQHRx9Pih2PQAPT2ebyA/edit', '_blank')}
                    className="text-[10px] font-black uppercase text-[var(--purple)] border-b border-[var(--purple)]"
                  >
                    Ver Planilha Oficial de Charts
                  </button>
                </div>
             </motion.div>
          )}

          {screen === 'bet' && (
             <motion.div
               key="bet"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">EMPIRE BET</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Aposte no Hot 100 dessa semana</p>
                </div>

                <div className="glass-card p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Valor da Aposta ($EC)</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                        value={betForm.valor}
                        onChange={(e) => setBetForm({...betForm, valor: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Selecione a Semana</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none"
                        value={betForm.semana}
                        onChange={(e) => setBetForm({...betForm, semana: e.target.value})}
                      >
                         <option value="">Selecione...</option>
                         <option value="Semana 18 - Março">Semana 18 - Março</option>
                         <option value="Semana 19 - Abril">Semana 19 - Abril</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Músicas do Top 10 (Radar)</label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                        {betMusics.map((m, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/5 text-[10px] flex justify-between items-center">
                            <span>{m.musica} - {m.artista}</span>
                            <span className="text-[var(--gold)] font-bold">{m.odds}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Minhas Previsões (#1, #2, #3...)</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--purple)] outline-none h-24"
                        placeholder="Ex: 1. Starboy, 2. Flowers, 3. As It Was"
                        value={betForm.previsoEs}
                        onChange={(e) => setBetForm({...betForm, previsoEs: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleBetSubmit}
                    disabled={loading || !betForm.semana || !betForm.previsoEs}
                    className="w-full py-4 rounded-xl bg-[var(--purple)] text-white bebas text-xl tracking-widest active:scale-95 transition-transform"
                  >
                    {loading ? 'Processando...' : 'Registrar Aposta'}
                  </button>
                </div>
             </motion.div>
          )}

          {screen === 'hub' && (
             <motion.div
                key="hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">EMPIRE HUB</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Contratações e Expansão</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div 
                    onClick={() => setProjectForm({ show: true, type: 'tour', data: { titulo: '', dataInicio: '', qtd: '10', continente: 'América do Sul', tipo: 'Arenas' } })}
                    className="glass-card p-5 border-l-4 border-l-[var(--gold)] flex items-center gap-5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                      <Music size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="bebas text-xl tracking-widest">CONTRATAR TOUR</h3>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-tight">Criação de Roteiro e Datas</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setProjectForm({ show: true, type: 'cinema', data: { titulo: '', tipo: 'Série', genero: 'Musical', dataInicio: '' } })}
                    className="glass-card p-5 border-l-4 border-l-[var(--neon)] flex items-center gap-5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--neon)]/10 flex items-center justify-center text-[var(--neon)]">
                      <Film size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="bebas text-xl tracking-widest">CINEMA & TV</h3>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-tight">Filmes, Séries e Reality Shows</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setScreen('market')}
                    className="glass-card p-5 border-l-4 border-l-[var(--green)] flex items-center gap-5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--green)]/10 flex items-center justify-center text-[var(--green)]">
                      <Store size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="bebas text-xl tracking-widest">EMPIRE MARKET</h3>
                      <p className="text-[10px] opacity-40 uppercase font-bold tracking-tight">Menu de Compras e Investimentos</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 border-dashed border-2 border-[var(--border)] opacity-30 mt-4">
                  <p className="text-[10px] italic text-center leading-relaxed">
                    "Preenchendo as informações, os dados são processados para gerar status, crítica e arrecadação do projeto."
                  </p>
                </div>
             </motion.div>
          )}

          {screen === 'market' && (
             <motion.div key="market" className="space-y-6">
                 <div className="text-center">
                    <h2 className="bebas text-3xl tracking-widest text-center">EMPIRE MARKET</h2>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Shopping de Investimentos</p>
                 </div>
                 
                 <div className="space-y-3 pb-10">
                   {[
                     { t: "Mural de Composições", d: "Compre ou venda letras de músicas", price: "$EC 5.000", icon: <Mic2 className="text-[var(--gold)]" /> },
                     { t: "Filantropia", d: "Aumente sua reputação e prestígio", price: "$EC 2.500", icon: <Sparkles className="text-pink-400" /> },
                     { t: "Imobiliária", d: "Compra de casa ou apartamento", price: "$EC 150.000+", icon: <Store className="text-[var(--neon)]" /> },
                     { t: "Rescisão de Contrato", d: "Multa e negociação com gravadora", price: "Variável", icon: <FileText size={20} className="text-[var(--red)]" /> },
                     { t: "Leilão Empire", d: "Itens raros e exclusivos", price: "$EC 10.000", icon: <Trophy className="text-[var(--gold)]" /> },
                     { t: "Viralização", d: "Impulsione qualquer música", price: "$EC 20.000", icon: <Zap className="text-[var(--green)]" /> },
                     { t: "Empire Bet", d: "Aposte em posições na Billboard", price: "$EC 1.000", icon: <LayoutGrid className="text-[var(--purple)]" /> },
                   ].map((item, i) => (
                     <div 
                       key={i} 
                       onClick={() => {
                         if (item.t === "Empire Bet") setScreen('bet');
                         else handleMarketClick(item.t, item.price);
                       }}
                       className="glass-card p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                     >
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{item.t}</h4>
                          <p className="text-[10px] opacity-40 font-medium uppercase tracking-tighter leading-tight">{item.d}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-[var(--gold)]">{item.price}</p>
                          <span className="text-[8px] opacity-30 font-bold uppercase">Acessar</span>
                        </div>
                     </div>
                   ))}
                 </div>
             </motion.div>
          )}

          {screen === 'finished-projects' && (
             <motion.div
               key="finished-projects"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6"
             >
                <div className="text-center">
                  <h2 className="bebas text-3xl tracking-widest text-center">PROJETOS FINALIZADOS</h2>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Histórico e Legado</p>
                </div>

                <div className="space-y-4">
                  {finishedProjects.length > 0 ? (
                    finishedProjects.map((proj, pIdx) => (
                      <div key={pIdx} className="glass-card p-5 border-l-4 border-l-[var(--purple)] flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)]">
                           <Trophy size={20} />
                         </div>
                         <div className="flex-1">
                           <h4 className="font-bold text-sm">{proj.titulo}</h4>
                           <p className="text-[10px] opacity-40 uppercase font-black">{proj.categoria || 'Projeto'}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] font-bold text-[var(--gold)]">CONCLUÍDO</p>
                           <p className="text-[8px] opacity-30">{proj.data_inicio || ''}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="glass-card p-10 text-center border-dashed border-2 opacity-30">
                       <p className="text-xs font-bold uppercase tracking-widest">Nenhum projeto concluído</p>
                       <p className="text-[10px] mt-2 leading-relaxed">Artistas sem histórico de tours ou filmes finalizados ainda.</p>
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
               <h2 className="bebas text-3xl tracking-widest">COMO CRESCER</h2>
               <div className="space-y-6">
                 {[
                   { t: "1. Distribuir Pontos", d: "Distribua os ganhos da semana entre os charts (Billboard, Spotify, etc)." },
                   { t: "2. eCoin + Investimento", d: "Invista seu saldo em playlists estratégicas para impulsionar a audiência do seu artista." },
                   { t: "3. Empire Hub", d: "Contrate tours e lance projetos cinematográficos para expandir sua fortuna e prestígio." }
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
          <Settings onClick={() => safeHaptic()} className="opacity-40 cursor-pointer active:scale-95" size={20} />
        </div>
      </footer>
    </div>
  );
}
