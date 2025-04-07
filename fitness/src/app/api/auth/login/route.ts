import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import axios from 'axios';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Login successful", userId: existingUser.id }, { status: 200 });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Login error:", error.response?.data);
            return NextResponse.json({ error: error.response?.data?.message || "An error occurred during login" }, { status: error.response?.status || 500 });
        } else {
            console.error("Login error:", error);
            return NextResponse.json({ error: "An error occurred during login" }, { status: 500 });
        }
    }
}
