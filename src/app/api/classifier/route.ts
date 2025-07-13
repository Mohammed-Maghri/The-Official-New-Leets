import { NextRequest, NextResponse } from "next/server";
import { classifyUsersByGender, FiltredData } from "@/lib/classifier"


export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json();

    if (!userData || !Array.isArray(userData)) {
      return NextResponse.json({ error: 'Invalid user data provided' }, { status: 400 });
    }
    console.log("user data", userData)
    const result = await classifyUsersByGender(userData as FiltredData[]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

