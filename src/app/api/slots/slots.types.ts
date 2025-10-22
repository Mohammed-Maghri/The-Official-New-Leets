interface slotstypes {
  day: string;
  month: string;
  year: string;
}

interface UserResponse {
  email: string;
  login: string;
  kind: string;
  image: string;
  staff: boolean;
  correction_point: number;
  pool_month: string;
  pool_year: string;
  location: string | null;
  wallet: number;
  campus_id: number;
  campus_name: string;
  level: number;
}

interface TeamMember {
  login: string;
  leader: boolean;
}

interface RawTeamData {
  locked_at: string;
  name: string;
  project_id: number;
  status: string;
  users: TeamMember[];
  locked: boolean;
  validated: boolean;
  closed_at: string | null;
  final_mark: number | null;
}

interface TransformedTeamData {
  name: string;
  project_id: number;
  status: string;
  users: TeamMember[];
  locked: boolean;
  validated: "yes" | "no";
  closed_at: string | null;
  final_mark: number | null;
}


const TimeFrameToday = new Date();
const TimeFrameTomorrow = new Date();

const today: slotstypes = {
  day:
    TimeFrameToday.getDate().toString().length == 1
      ? "0" + TimeFrameToday.getDate().toString()
      : TimeFrameToday.getDate().toString(),
  month:
    (TimeFrameToday.getMonth() + 1).toString().length == 1
      ? "0" + (TimeFrameToday.getMonth() + 1).toString()
      : (TimeFrameToday.getMonth() + 1).toString(),
  year: TimeFrameToday.getFullYear().toString(),
};

TimeFrameTomorrow.setDate(TimeFrameToday.getDate() + 1);

const tomorow: slotstypes = {
  day:
    TimeFrameTomorrow.getDate().toString().length == 1
      ? "0" + TimeFrameTomorrow.getDate().toString()
      : TimeFrameTomorrow.getDate().toString(),
  month:
    (TimeFrameTomorrow.getMonth() + 1).toString().length == 1
      ? "0" + (TimeFrameTomorrow.getMonth() + 1).toString()
      : (TimeFrameTomorrow.getMonth() + 1).toString(),
  year: TimeFrameTomorrow.getFullYear().toString(),
};

export type { UserResponse, TeamMember, RawTeamData, TransformedTeamData };
export { today, tomorow };
