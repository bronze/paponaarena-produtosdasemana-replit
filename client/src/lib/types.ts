export interface Episode {
  id: number;
  title: string;
  date: string;
  description: string;
  youtubeLink?: string;
  spotifyLink?: string;
  /** Quem apresenta o episódio (ids de Person). Obrigatório: sem padrão implícito. */
  hosts: string[];
  /** Convidados que participam ao vivo, no palco ou em call (ids de Person). */
  cohosts?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  url?: string;
  parentId?: string;
  alsoCredits?: string[];
}

export interface Person {
  id: string;
  name: string;
  linkedinUrl?: string;
  avatarUrl?: string;
}

export interface Mention {
  id: string;
  episodeId: number;
  personId: string;
  productId: string;
  context?: string;
}
