
interface slotstypes {
  day: string;
  month: string;
  year: string;
}

// interface BodyRequest {
//     campus: string ,
//     range_frist_date : number, 
//     range_second_date : number,   
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

export { today, tomorow };
