import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const TimeFrameToday = new Date();
    const TimeFrameTomorrow = new Date();

    console.log(
      " !!!! ------> ",
      TimeFrameToday.getDate(),
      TimeFrameToday.getMonth() + 1,
      TimeFrameToday.getFullYear()
    );

    console.log(
      " !!!! ------> ",
      TimeFrameTomorrow.setDate(TimeFrameToday.getDate() + 1),
      TimeFrameToday.getDate(),
      TimeFrameTomorrow.getMonth() + 1,
      TimeFrameTomorrow.getFullYear()
    );

    return NextResponse.json(
      {
        time_frame_today: "test",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
