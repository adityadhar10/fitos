import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

import JWT_SECRET from '../config/jwt.js';

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const authService = {
  async signup(data: any) {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AuthError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError('Invalid email or password.', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AuthError('Invalid email or password.', 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true,
        calorieGoal: true, proteinGoal: true, carbGoal: true, fatGoal: true,
      },
    });
    if (!user) {
      throw new AuthError('User not found.', 404);
    }
    return { user };
  },

  async updateGoals(userId: string, data: any) {
    const { calorieGoal, proteinGoal, carbGoal, fatGoal } = data;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { calorieGoal, proteinGoal, carbGoal, fatGoal },
      select: {
        id: true, name: true, email: true,
        calorieGoal: true, proteinGoal: true, carbGoal: true, fatGoal: true,
      },
    });
    return { user };
  }
};
