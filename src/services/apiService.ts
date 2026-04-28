const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec";

export interface Artist {
  nome: string;
  foto: string;
  saldo: number;
  fortuna_total: number; // Google Apps Script return name
  fortunaTotal?: number; // Keep for safety if used elsewhere
  status: string;
  prestigio: number;
  fadiga: number;
  tour_info?: any;
}

export const apiService = {
  getArtistsByTg: async (tgId: string | number): Promise<Artist[]> => {
    try {
      // Sincronizado com o Script: acao=meus_artistas e telegram_id
      const response = await fetch(`${SCRIPT_URL}?acao=meus_artistas&telegram_id=${tgId}`);
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
    const url = `${SCRIPT_URL}?acao=compra_unificada_tour&nome=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}&titulo=${encodeURIComponent(titulo)}&dataInicio=${dataInicio}&qtd=${qtd}&continente=${continente}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error("Error buying tour:", error);
      return "Erro de conexão.";
    }
  },

  buyCinema: async (params: { nome: string; titulo: string; tipo: string; genero: string; dataInicio: string }) => {
    const { nome, titulo, tipo, genero, dataInicio } = params;
    const url = `${SCRIPT_URL}?acao=compra_cinema&nome=${encodeURIComponent(nome)}&titulo=${encodeURIComponent(titulo)}&tipo=${encodeURIComponent(tipo)}&genero=${encodeURIComponent(genero)}&dataInicio=${dataInicio}`;
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error("Error buying cinema:", error);
      return "Erro de conexão.";
    }
  },

  submitAction: async (params: { nome: string; acao: string; telegram_id: string }) => {
    const { nome, acao, telegram_id } = params;
    const url = `${SCRIPT_URL}?acao=registrar_ponto&nome=${encodeURIComponent(nome)}&tipo_acao=${encodeURIComponent(acao)}&telegram_id=${telegram_id}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error submitting action:", error);
      return { status: "error", message: "Conexão falhou" };
    }
  },

  marketAction: async (params: { nome: string; acao: string; valor?: string }) => {
    const { nome, acao, valor } = params;
    const url = `${SCRIPT_URL}?acao=market_buy&nome=${encodeURIComponent(nome)}&item=${encodeURIComponent(acao)}&valor=${valor || ''}`;
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error market action:", error);
      return { status: "error", message: "Erro no Market" };
    }
  }
};
