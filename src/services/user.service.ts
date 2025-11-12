import { UserCreate, UserLogin } from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/errors";

dotenv.config();

export async function create(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<UserCreate> {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
  });

  return {
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  }
}

export async function login(
  userLogin: UserLogin,
): Promise<{ token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: userLogin.email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    userLogin.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  return { token };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateProfile(
  userId: string,
  updateData: { name?: string; email?: string },
) {
  if (updateData.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: updateData.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError("Email already in use");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
}
