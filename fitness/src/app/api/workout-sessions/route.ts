// /app/api/workout-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const {
      sessionId,
      participants,
      exerciseType,
      timeSpent,
      startedAt,
      endedAt
    } = await req.json();

    // Create workout session in database
    const workoutSession = await prisma.workoutSession.create({
      data: {
        id: sessionId,
        exerciseType,
        startedAt: new Date(parseInt(startedAt) * 1000), // Convert seconds to Date
        endedAt: new Date(parseInt(endedAt) * 1000), // Convert seconds to Date
        timeSpentSeconds: timeSpent,
        hostId: parseInt(session.user.email, 10), // Ensure hostId is a number
      }
    });

    // Create session participants
    const participantPromises = participants.map(async (participant: any) => {
        const userId = participant.userId;
      
        // Check if user exists
        const user = await prisma.user.findUnique({
        where: { id: userId },
        });

        if (!user) {
        throw new Error(`User with ID ${userId} does not exist`);
        }

        // Create participant record
        return prisma.workoutParticipant.create({
            data: {
            userId: user.id,
            workoutSessionId: workoutSession.id,
            repCount: participant.count,
            }
        });
    });

    await Promise.all(participantPromises);

    return NextResponse.json({ 
      success: true, 
      sessionId: workoutSession.id 
    });
  } catch (error) {
    console.error('Error creating workout session:', error);
    return NextResponse.json(
      { error: 'Failed to create workout session' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10); // Ensure userId is a number
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session details
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: parseInt(sessionId, 10) },
      include: {
        participants: {
        include: {
          user: {
            select: {
            id: true,
            name: true,
            email: true,
            }
          }
        }
        }
      }
    });

      if (!workoutSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json(workoutSession);
    } else {
      // Get all sessions for the user
      const sessions = await prisma.workoutSession.findMany({
        where: {
          OR: [
            { hostId: userId },
            { participants: { some: { userId: userId } } }
          ]
        },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        }
      });

      return NextResponse.json(sessions);
    }
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout sessions' }, 
      { status: 500 }
    );
  }
}