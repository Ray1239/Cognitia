import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  try {
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workout || workout.userId !== parseInt(session.user.id as string)) {
      return NextResponse.json({ success: false, error: "Workout not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: workout });
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch workout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  try {
    const workout = await prisma.workout.findUnique({ where: { id: parseInt(id) } });
    if (!workout || workout.userId !== parseInt(session.user.id as string)) {
      return NextResponse.json({ success: false, error: "Workout not found or unauthorized" }, { status: 404 });
    }

    const { timeSpent, reps, endTimeStamp } = await req.json();
    const updatedWorkout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        timeSpent: timeSpent ?? workout.timeSpent,
        reps: reps ?? workout.reps,
        endTimeStamp: endTimeStamp ? new Date(endTimeStamp) : workout.endTimeStamp,
      },
    });

    return NextResponse.json({ success: true, message: "Workout updated successfully", data: updatedWorkout });
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json({ success: false, error: "Failed to update workout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  try {
    const workout = await prisma.workout.findUnique({ where: { id: parseInt(id) } });
    if (!workout || workout.userId !== parseInt(session.user.id as string)) {
      return NextResponse.json({ success: false, error: "Workout not found or unauthorized" }, { status: 404 });
    }

    await prisma.workout.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, message: "Workout deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json({ success: false, error: "Failed to delete workout" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}