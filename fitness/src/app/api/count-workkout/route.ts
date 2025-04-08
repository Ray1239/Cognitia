import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export async function POST(req:Request) {
    
}