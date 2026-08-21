export interface Peon {
  id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PeonPayload  {
  nombre: string;
  activo: boolean;
}