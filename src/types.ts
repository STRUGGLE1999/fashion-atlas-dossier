export interface ArchiveItem {
  id: string;
  name: string;
  category: string;
  designer: string;
  image: string;
  description: string;
  history: string;
  materials: string;
  details: string[];
}

export interface AestheticGuide {
  id: string;
  title: string;
  introduction: string;
  summary: string;
  sections: { subtitle: string; content: string }[];
}

export interface FashionMovie {
  id: string;
  name: string;
  year: string;
  director: string;
  image: string;
  rating: number;
  recommendationReason: string;
}

export interface TrendTopic {
  id: string;
  week: string;
  name: string;
  comment: string;
  bannerImage: string;
  keyItems: string[];
  evidenceImages: { url: string; caption: string }[];
}

export interface OutfitFormula {
  id: string;
  trendId: string;
  name: string;
  description: string;
  pieces: { role: string; name: string; iconName: string }[];
  styleTips: string[];
}

export interface MoodboardItem {
  id: string;
  title: string;
  image?: string;
  type: "garment" | "trend" | "formula" | "note";
  savedAt: string;
  tags?: string[];
  notes?: string;
  metadata?: any;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface FashionBook {
  id: string;
  name: string;
  originalName: string;
  author: string;
  year: string;
  category: "入门" | "进阶" | "视觉" | "专业";
  rating: number;
  image: string;
  recommendationReason: string;
  availabilityNote: string;
  availLink: string;
}

export interface StyleEntry {
  id: string;
  name: string;
  enName: string;
  definition: string;
  historyText: string;
  keySilhouette: string;
  keyMaterials: string;
  keyColors: string[];
  vibeWords: string[];
  representativeRunway: string;
  dailyWearTip: string;
  commonPitfall: string;
}

export interface RunwayShow {
  id: string;
  season: string; // e.g. "1999 SS"
  brand: string;   // e.g. "Alexander McQueen"
  title: string;   // e.g. "No. 13"
  importance: string;
  whatToWatch: string;
  associatedStyles: string[];
  videoRefer: string; // text or link explanation
  image: string;
}

