const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec";

export interface Artist {
  nome: string;
  foto: string;
  saldo: number;
  fortuna_total: number;
  fortunaTotal?: number;
  status: string;
  prestigio: number;
  fadiga: number;
  tour_info?: any;
  gravadora?: string;
}

export const apiService = {
  getArtistsByTg: async (tgId: string | number): Promise<Artist[]> => {
    try {
      // Sincronizado com o Script: acao=meus_artistas e telegram_id
      const response = await fetch(`${SCRIPT_URL}?acao=meus_artistas&telegram_id=${tgId}&_t=${Date.now()}`);
      if (!response.ok) throw new Error("Erro na rede");
      const data = await response.json();
      const artists = Array.isArray(data) ? data : [];
      // Mapeia para garantir que fortunaTotal e fortuna_total existam (compatibilidade)
      return artists.map((a: any) => ({
        ...a,
        nome: (a.nome || '').trim(), // Trim name to avoid match issues
        fortunaTotal: Number(a.fortuna_total || a.fortunaTotal || 0),
        fortuna_total: Number(a.fortuna_total || a.fortunaTotal || 0),
        fadiga: Number(a.fadiga || 0),
        prestigio: Number(a.prestigio || 0),
        saldo: Number(a.saldo || 0)
      }));
    } catch (error) {
      console.error("Error fetching artists:", error);
      return [];
    }
  },

  buyTour: async (params: { nome: string; tipo: string; titulo: string; dataInicio: string; qtd: number; continente: string }) => {
    const { nome, tipo, titulo, dataInicio, qtd, continente } = params;
    const trimmedNome = nome.trim();
    const url = `${SCRIPT_URL}?acao=compra_unificada_tour&artista=${encodeURIComponent(trimmedNome)}&act_principal=${encodeURIComponent(trimmedNome)}&tipo=${encodeURIComponent(tipo)}&titulo=${encodeURIComponent(titulo)}&dataInicio=${dataInicio}&datas=${Math.floor(qtd)}&continente=${encodeURIComponent(continente)}&_t=${Date.now()}`;
    
    console.log(`[BUY TOUR] Requesting: ${trimmedNome} | Plan: ${titulo} | Dates: ${qtd}`);

    try {
      const response = await fetch(url);
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        return result;
      } catch (e) {
        // Handle text-based success/error messages from GAS
        const isError = text.includes('❌') || text.toLowerCase().includes('erro') || text.toLowerCase().includes('insuficiente');
        return { 
          status: isError ? 'error' : 'success', 
          message: text 
        };
      }
    } catch (error) {
      console.error("Error buying tour:", error);
      return { status: 'error', message: "Erro de conexão ao servidor." };
    }
  },

  buyCinema: async (params: { nome: string; titulo: string; tipo: string; genero: string; dataInicio: string }) => {
    const { nome, titulo, tipo, genero, dataInicio } = params;
    const url = `${SCRIPT_URL}?acao=compra_cinema&artista=${encodeURIComponent(nome)}&act_principal=${encodeURIComponent(nome)}&titulo=${encodeURIComponent(titulo)}&tipo=${encodeURIComponent(tipo)}&genero=${encodeURIComponent(genero)}&dataInicio=${dataInicio}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { 
          status: (text.includes('❌') || text.toLowerCase().includes('erro')) ? 'error' : 'success', 
          message: text 
        };
      }
    } catch (error) {
      console.error("Error buying cinema:", error);
      return { status: 'error', message: "Erro de conexão." };
    }
  },

  marketBuy: async (nome: string, itemId: string) => {
    const url = `${SCRIPT_URL}?acao=comprar_item&artista=${encodeURIComponent(nome)}&itemId=${encodeURIComponent(itemId)}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede"; }
  },

  submitViral: async (nome: string, musica: string) => {
    const url = `${SCRIPT_URL}?acao=viral&artista=${encodeURIComponent(nome)}&musica=${encodeURIComponent(musica)}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede"; }
  },

  submitFilantropia: async (nome: string, causa: string, valor: string) => {
    const url = `${SCRIPT_URL}?acao=filantropia&artista=${encodeURIComponent(nome)}&causa=${encodeURIComponent(causa)}&valor=${valor}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede"; }
  },

  registrarMusica: async (params: { nome: string; musica: string; genero: string; data: string }) => {
    const { nome, musica, genero, data } = params;
    const url = `${SCRIPT_URL}?acao=registrar_musica&artista=${encodeURIComponent(nome)}&act_principal=${encodeURIComponent(nome)}&musica=${encodeURIComponent(musica)}&genero=${encodeURIComponent(genero)}&data=${encodeURIComponent(data)}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro ao registrar música."; }
  },

  registrarAlbum: async (params: { nome: string; album: string; genero: string; data: string }) => {
    const { nome, album, genero, data } = params;
    const url = `${SCRIPT_URL}?acao=registrar_album&artista=${encodeURIComponent(nome)}&act_principal=${encodeURIComponent(nome)}&album=${encodeURIComponent(album)}&genero=${encodeURIComponent(genero)}&data=${encodeURIComponent(data)}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro ao registrar álbum."; }
  },

  getRadar: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=radar&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getAllArtists: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=listar_todos&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getHallOfFame: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=hall_da_fama&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getFinances: async (nome: string, tipo: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=finances&artista=${encodeURIComponent(nome)}&tipo=${tipo}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getProjects: async (nome: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=projetos&artista=${encodeURIComponent(nome)}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getTourAgenda: async (nome: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=agenda_tour&artista=${encodeURIComponent(nome)}&_t=${Date.now()}`);
      const data = await response.json();
      return data;
    } catch (e) { return null; }
  },

  getBetMusics: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=musicas_bet&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return { erro: "Erro ao carregar" }; }
  },

  submitBet: async (nome: string, valor: string, semana: string, previsoes: string) => {
    try {
      const url = `${SCRIPT_URL}?acao=bet&artista=${encodeURIComponent(nome)}&valor=${valor}&semana=${encodeURIComponent(semana)}&previsoes=${encodeURIComponent(previsoes)}&_t=${Date.now()}`;
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede"; }
  },

  getPainelOff: async (tgId: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=painel_off&telegram_id=${tgId}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return { off_name: '', artistas: [] }; }
  },

  getPontosPainel: async (tgId: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=pontos_painel&telegram_id=${tgId}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  baterPonto: async (params: { nome_off: string; tipo: string; conteudo?: string; codigo?: string }) => {
    const { nome_off, tipo, conteudo, codigo } = params;
    const url = `${SCRIPT_URL}?acao=bater_ponto&nome_off=${encodeURIComponent(nome_off)}&tipo=${encodeURIComponent(tipo)}&conteudo=${encodeURIComponent(conteudo || '')}&codigo=${encodeURIComponent(codigo || '')}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede ao bater ponto."; }
  },

  distribuirPontos: async (params: any) => {
    const query = new URLSearchParams({ 
      acao: 'distribuir_pontos', 
      ...params, 
      _t: Date.now().toString() 
    }).toString();
    try {
      const response = await fetch(`${SCRIPT_URL}?${query}`);
      return await response.text();
    } catch (e) { return "Erro ao salvar pontos."; }
  },

  getArtistMusicList: async (nome: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=lista_musicas&artista=${encodeURIComponent(nome)}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  }
};
