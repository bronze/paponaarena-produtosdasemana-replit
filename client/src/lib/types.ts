export interface Episode {
  id: number;
  title: string;
  date: string;
  description: string;
  youtubeLink?: string;
  spotifyLink?: string;
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
