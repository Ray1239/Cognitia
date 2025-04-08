import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export async function POST(req: NextRequest) {
    try {
        const { userId, workoutId } = await req.json()
        if (!workoutId || !userId) {
            return NextResponse.json({ error: "Missing those fields" }, { status: 400 });
        }

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_workoutId: { userId, workoutId }
            }
        });
        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: {
                    userId_workoutId: {
                        userId,
                        workoutId
                    }
                }
            });
            return NextResponse.json({ true: "UnBookmarked successfully" }, { status: 200 });
        }

        const newBookmark = await prisma.bookmark.create({
            data: {
                userId,
                workoutId
            }
        });
        return NextResponse.json(
            {
                success: true,
                message: 'Bookmarked successfully',
                data: newBookmark
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error while creating bookmarking", error);
        return NextResponse.json({ error: "Server error while Bookmarking" }, { status: 500 });

    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, error: "Missing userId parameter" }, { status: 400 });
        }

        const bookmark = await prisma.bookmark.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                Workout: true
            }
        });
        return NextResponse.json({ success: true, data: bookmark }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch bookmarks" }, { status: 200 });
        console.error("Error while fetching all bookmarks");
    }
}