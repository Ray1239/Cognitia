import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, sets, reps, weight, calories,duration } = await req.json();
        const userId = parseInt(session.user.id); // Convert userId to a number

        // Create the exercise log
        const exerciseLog = await prisma.exercise.create({
            data: {
                userId,
                name,
                sets,
                reps,
                weight,
                calories,
                duration
            },
        });

        return NextResponse.json(exerciseLog, { status: 201 });
    } catch (error) {
        console.error("Error creating Exercise Log:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}


export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);

        // Fetch the user's exercise logs
        const exerciseLogs = await prisma.exercise.findMany({
            where: { userId },
            orderBy: { date: "desc" }, // Assumes there is a 'date' field in Exercise model
        });

        return NextResponse.json(exerciseLogs, { status: 200 });
    } catch (error) {
        console.error("Error fetching Exercise Logs:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
