export interface User {
  login: string;
  leader: boolean;
  vip_status?: string | null;
  badges?: string[];
}

export interface ResponseData {
  name: string;
  project_id: string;
  status: string;
  users: User[];
  locked: boolean;
  validated: string;
  closed_at: string;
  final_mark: number | null;
}

export interface CampusType {
  name: string;
  id: number;
}

export interface ProjectInfo {
  project_id: number;
  name: string;
  difficulty: number;
  duration: string;
  slug: string;
}

export interface FilterOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export type ProjectFilterType = "all" | "known" | "unknown";
export type SpecificProjectFilterType = string;

export interface AnimationConfig {
  cardStagger: number;
  cardDuration: number;
  dropdownInitial: { opacity: number; y: number; scale: number };
  dropdownAnimate: { opacity: number; y: number; scale: number };
  dropdownExit: { opacity: number; y: number; scale: number };
  buttonInitial: { opacity: number; scale: number };
  buttonAnimate: { opacity: number; scale: number };
  buttonExit: { opacity: number; scale: number };
}

export interface VipPageState {
  dataReturned: ResponseData[] | null | undefined;
  filteredData: ResponseData[] | null | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  pageNumber: number;
  selectedCampus: CampusType;
  campusDropdownOpen: boolean;
  projectsMap: Map<number, ProjectInfo>;
  projectFilter: ProjectFilterType;
  projectFilterDropdownOpen: boolean;
  specificProjectFilter: SpecificProjectFilterType;
  specificProjectDropdownOpen: boolean;
}
