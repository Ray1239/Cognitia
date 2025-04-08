import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, duration, difficulty, goals, body, date } = await req.json();
    const userId = parseInt(session.user.id as string);

    if (!title || !description || !duration || !difficulty || !goals || !body) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newWorkout = await prisma.workout.create({
      data: {
        userId,
        title,
        description,
        duration,
        difficulty,
        goals,
        body,
        date: date ? new Date(date) : new Date(),
        startTimeStamp: date ? new Date(date) : new Date(),
        endTimeStamp: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(
      { success: true, message: "Workout scheduled successfully", data: newWorkout },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while creating workout:", error);
    return NextResponse.json({ success: false, error: "Failed to create workout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id as string);
    const workouts = await prisma.workout.findMany({
      where: { userId },
    });

    return NextResponse.json(
      { success: true, message: "Workouts fetched successfully", data: workouts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching workouts:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch workouts" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}