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
        fortunaTotal: a.fortuna_total || a.fortunaTotal || 0,
        fortuna_total: a.fortuna_total || a.fortunaTotal || 0,
        fadiga: a.fadiga || 0,
        prestigio: a.prestigio || 0,
        saldo: a.saldo || 0
      }));
    } catch (error) {
      console.error("Error fetching artists:", error);
      return [];
    }
  },

  buyTour: async (params: { nome: string; tipo: string; titulo: string; dataInicio: string; qtd: number; continente: string }) => {
    const { nome, tipo, titulo, dataInicio, qtd, continente } = params;
    const url = `${SCRIPT_URL}?acao=compra_unificada_tour&nome=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}&titulo=${encodeURIComponent(titulo)}&dataInicio=${dataInicio}&qtd=${qtd}&continente=${continente}&_t=${Date.now()}`;
    try {
      const response = await fetch(url);
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        return result;
      } catch (e) {
        // Se não for JSON, é a mensagem de sucesso ou erro em texto
        return { 
          status: (text.includes('❌') || text.toLowerCase().includes('erro')) ? 'error' : 'success', 
          message: text 
        };
      }
    } catch (error) {
      console.error("Error buying tour:", error);
      return { status: 'error', message: "Erro de conexão." };
    }
  },

  buyCinema: async (params: { nome: string; titulo: string; tipo: string; genero: string; dataInicio: string }) => {
    const { nome, titulo, tipo, genero, dataInicio } = params;
    const url = `${SCRIPT_URL}?acao=compra_cinema&nome=${encodeURIComponent(nome)}&titulo=${encodeURIComponent(titulo)}&tipo=${encodeURIComponent(tipo)}&genero=${encodeURIComponent(genero)}&dataInicio=${dataInicio}&_t=${Date.now()}`;
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

  marketAction: async (params: { nome: string; acao: string; valor?: string }) => {
    const { nome, acao, valor } = params;
    const url = `${SCRIPT_URL}?acao=market_buy&nome=${encodeURIComponent(nome)}&item=${encodeURIComponent(acao)}&valor=${valor || ''}&_t=${Date.now()}`;
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
      console.error("Error market action:", error);
      return { status: "error", message: "Erro no Market" };
    }
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
      const response = await fetch(`${SCRIPT_URL}?acao=financas&nome=${encodeURIComponent(nome)}&tipo=${tipo}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getProjects: async (nome: string) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=projetos&nome=${encodeURIComponent(nome)}&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return []; }
  },

  getBetMusics: async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?acao=musicas_bet&_t=${Date.now()}`);
      return await response.json();
    } catch (e) { return { erro: "Erro ao carregar" }; }
  },

  submitBet: async (nome: string, valor: string, semana: string, previsoes: string) => {
    try {
      const url = `${SCRIPT_URL}?acao=bet&nome=${encodeURIComponent(nome)}&valor=${valor}&semana=${encodeURIComponent(semana)}&previsoes=${encodeURIComponent(previsoes)}&_t=${Date.now()}`;
      const response = await fetch(url);
      return await response.text();
    } catch (e) { return "Erro na rede"; }
  }
};
