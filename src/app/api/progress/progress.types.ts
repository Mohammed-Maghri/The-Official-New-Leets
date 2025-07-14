const Month = [
  "0",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

 interface UserProgress {
    user: {
      email: string;
      login: string;
      kind: string;
      image: {
        versions: {
          medium: string;
        };
      };
      usual_full_name: string;
      staff: boolean;
      correction_point: number;
      pool_month: string;
      pool_year: string;
      location: string | null;
      wallet: number;
    };
    level: number;
  }
export { Month };
export type { UserProgress };
