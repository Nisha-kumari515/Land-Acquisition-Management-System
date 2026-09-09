import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const userInclude = {
    role: true,
    state: { select: { id: true, code: true, name: true } },
    district: { select: { id: true, code: true, name: true } }
};

function toHash(value) {
    return crypto.createHash('sha256').update(`bhoomisetu-demo:${value}`).digest('hex');
}

export function signToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role.code,
            stateId: user.stateId,
            districtId: user.districtId
        },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
}

export async function login(email, password) {
    if (!email || !password) {
        throw new AppError(400, 'VALIDATION_ERROR', 'email and password are required');
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: userInclude
    });

    if (!user || user.passwordHash !== toHash(password)) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.isActive) {
        throw new AppError(403, 'USER_INACTIVE', 'User account is inactive');
    }

    const token = signToken(user);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.code,
            state: user.state,
            district: user.district
        }
    };
}

export async function me(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: userInclude
    });

    if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.code,
        isActive: user.isActive,
        state: user.state,
        district: user.district
    };
}
