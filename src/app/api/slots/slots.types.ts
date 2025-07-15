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

// Interface for individual user in a team
interface TeamUser {
  login: string;
  leader: boolean;
}

// Interface for raw team data from 42 Intra API
interface RawTeamData {
  name: string;
  project_id: number;
  status: string;
  users: TeamUser[];
  locked: boolean;
  validated: boolean;
  closed_at: string | null;
  final_mark: number | null;
}

// Interface for transformed team data sent to frontend
interface TransformedTeamData {
  name: string;
  project_id: number;
  status: string;
  users: TeamUser[];
  locked: boolean;
  validated: "yes" | "no";
  closed_at: string | null;
  final_mark: number | null;
}

// interface BodyRequest {
//   campus: string;
//   range_frist_date: number;
//   range_second_date: number;
// }

const TimeFrameToday = new Date();
const TimeFrameTomorrow = new Date();

const today: slotstypes = {
  day:
    TimeFrameToday.getDate().toString().length == 1
      ? "0" + TimeFrameToday.getDate().toString()
      : TimeFrameToday.getDate().toString(),
  month:
    TimeFrameToday.getMonth().toString().length == 1
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
    TimeFrameTomorrow.getMonth().toString().length == 1
      ? "0" + (TimeFrameTomorrow.getMonth() + 1).toString()
      : (TimeFrameTomorrow.getMonth() + 1).toString(),
  year: TimeFrameTomorrow.getFullYear().toString(),
};

export type { UserResponse, TeamUser, RawTeamData, TransformedTeamData };
export { today, tomorow };
