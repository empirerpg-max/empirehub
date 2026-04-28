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
      const response = await fetch(`${SCRIPT_URL}?acao=get_artistas_by_tg&tg_id=${tgId}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const artists = Array.isArray(data) ? data : [];
      // Map to ensure both versions exist
      return artists.map((a: any) => ({
        ...a,
        fortunaTotal: a.fortunaTotal || a.fortuna_total || 0,
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
  }
};
