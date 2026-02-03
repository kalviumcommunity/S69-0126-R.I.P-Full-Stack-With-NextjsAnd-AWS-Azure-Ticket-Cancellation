import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  age?: number;
  createdAt: string;
};


// Prisma-based implementations
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (params: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "admin" | "user";
  age?: number;
}) => {
  // Map lowercase role to database enum values
  const roleMap = {
    admin: "ADMIN",
    user: "PASSENGER",  // "user" maps to PASSENGER in the database
  } as const;
  
  return await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      password: params.passwordHash, // Prisma model uses 'password'
      role: roleMap[params.role || "user"] as any,
    },
  });
};

export type PublicUser = Omit<User, "passwordHash">;

export const toPublicUser = (user: any): PublicUser => {
  // Remove sensitive fields
  // Adjust according to your Prisma model
  // If your model uses 'password' instead of 'passwordHash', update accordingly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
};

export const getPublicUsers = async (): Promise<PublicUser[]> => {
  const users = await prisma.user.findMany();
  return users.map(toPublicUser);
};
