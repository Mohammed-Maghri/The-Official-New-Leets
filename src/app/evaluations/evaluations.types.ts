export interface EvaluationData {
  id: number;
  created_at: string;
  begin_at: string;
  filled_at: string | null;
  final_mark: number | null;
  comment: string | null;
  feedback: string | null;
  flag: {
    id: number;
    name: string;
    positive: boolean;
    icon: string;
  } | null;
  corrector: {
    id: number;
    login: string;
    full_name: string;
    profile_picture: string | null;
  };
  correcteds: Array<{
    id: number;
    login: string;
    full_name: string;
    profile_picture: string | null;
  }>;
  project: {
    id: number;
    name: string;
    final_mark: number | null;
  };
  team: {
    id: number;
    name: string;
    status: string;
    validated: boolean | null;
    closed: boolean;
  };
  passed: boolean;
}

export interface CampusType {
  name: string;
  id: number;
}

export const CampusList: CampusType[] = [
  { name: "All Campuses", id: 0 },
  { name: "Khouribga", id: 16 },
  { name: "Bengrir", id: 21 },
  { name: "Tetouan", id: 55 },
  { name: "Rabat", id: 75 },
  { name: "Paris", id: 1 },
  { name: "Lyon", id: 9 },
  { name: "Barcelona", id: 46 },
  { name: "Mulhouse", id: 48 },
  { name: "Lausanne", id: 47 },
  { name: "Istanbul", id: 49 },
  { name: "Berlin", id: 51 },
  { name: "Florence", id: 52 },
  { name: "Vienna", id: 53 },
  { name: "Prague", id: 56 },
  { name: "London", id: 57 },
  { name: "Porto", id: 58 },
  { name: "Luxembourg", id: 59 },
  { name: "Perpignan", id: 60 },
  { name: "Tokyo", id: 26 },
  { name: "Moscow", id: 17 },
  { name: "Madrid", id: 22 },
  { name: "Seoul", id: 29 },
  { name: "Rome", id: 30 },
  { name: "Yerevan", id: 32 },
  { name: "Bangkok", id: 33 },
  { name: "Amman", id: 35 },
  { name: "Malaga", id: 37 },
  { name: "Nice", id: 41 },
  { name: "Abu Dhabi", id: 43 },
  { name: "Wolfsburg", id: 44 },
];
