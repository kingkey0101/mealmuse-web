// 
import { NextAuthOptions, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt'
import clientPromise from './db'
import { encode } from 'next-auth/jwt'
import jwt from 'jsonwebtoken'

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            token?: any;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        encode: async ({ token, secret }) => {
            return jwt.sign(token as object, secret as string);
        },
        decode: async ({ token, secret }) => {
            return jwt.verify(token as string, secret as string) as any;
        }
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const client = await clientPromise;
                const db = client.db();
                const users = db.collection("users");
                const user = await users.findOne({ email: credentials.email });

                if (!user) return null;

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )
                if (!isValid) return null;
                return {
                    id: user._id.toString(),
                    email: user.email,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // when user logs in -> attach ID
            if (user) {
                token.id = (user as any).id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {

                session.user.id = token.id;
                session.user.token = token;
            }
            return session

        }
    },
    pages: {
        signIn: '/auth/login',
    }
}