import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

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

let nextId = 1;
const users: User[] = [];

export const findUserByEmail = (email: string): User | undefined => {
  return users.find((u) => u.email === email);
};

export const createUser = (params: {
  name: string;
  email: string;
  passwordHash: string;
  role?: "admin" | "user";
  age?: number;
}): User => {
  const user: User = {
    id: nextId++,
    name: params.name,
    email: params.email,
    passwordHash: params.passwordHash,
    role: params.role || "user",
    age: params.age,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
};

export const getAllUsers = (): User[] => {
  return users;
};

export type PublicUser = Omit<User, "passwordHash">;

export const toPublicUser = (user: User): PublicUser => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const getPublicUsers = (): PublicUser[] => users.map(toPublicUser);
