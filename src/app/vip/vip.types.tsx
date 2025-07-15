interface users {
  login: string;
  leader: boolean;
}

interface ResponseData {
  name: string;
  project_id: string;
  status: string;
  users: users[];
  locked: boolean;
  validated: string;
  closed_at: string;
  final_mark: number | null;
}

export type { ResponseData };
