import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json(

            { error: 'Email and password are required' },
            { status: 400 }

        );
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');

    const existing = await users.findOne({ email });

    if (existing) {
        return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
        );
    }

    const hashed = await bcrypt.hash(password, 10);

    await users.insertOne({
        email,
        password: hashed,
        createdAt: new Date()
    });
    console.log('register API hit')
    return NextResponse.json({ ok: true }, { status: 201 })
}