import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            token: string;
        } & DefaultSession['user'];
    }
    interface User extends DefaultUser {
        id: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        // encryption: false,
    }
}