import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import axios from 'axios'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        age:0
      }
    })

    return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Signup error:", error.response?.data)
      return NextResponse.json({ error: error.response?.data?.message || "An error occurred during signup" }, { status: error.response?.status || 500 })
    } else {
      console.error("Signup error:", error)
      return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 })
    }
  }
}