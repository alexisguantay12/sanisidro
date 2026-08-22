export interface Comprador {
  id: number;
  nombre: string;
  observacion: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompradorPayload {
  nombre: string;
  observacion?: string;
}