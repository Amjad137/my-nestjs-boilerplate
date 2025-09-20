import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Types } from 'mongoose';
import * as crypto from 'crypto';
import { SessionRepository } from '@modules/session/repositories/session.repository';
import { SessionDocument } from '@modules/session/entities/session.entity';

@Injectable()
export class SessionService {
    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly configService: ConfigService,
    ) {}

    async createSession(
        userId: string | Types.ObjectId,
        userAgent: string,
    ): Promise<SessionDocument> {
        // Generate refresh token
        const refreshToken = this.generateRefreshToken();

        const expiresAt = new Date();
        expiresAt.setDate(
            expiresAt.getDate() +
                this.configService.get<number>('auth.refreshTokenExpiresIn'),
        );

        // Create session
        return this.sessionRepository.create({
            userId: new Types.ObjectId(userId),
            refreshToken,
            expiresAt,
            userAgent,
        });
    }

    async validateRefreshToken(
        refreshToken: string,
        userId?: Types.ObjectId,
    ): Promise<SessionDocument> {
        const query: mongoose.FilterQuery<SessionDocument> = { refreshToken };
        if (userId) {
            query.userId = userId;
        }

        const session = await this.sessionRepository.findOne(query);

        if (!session) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (session.expiresAt < new Date()) {
            // Clean up expired session
            await this.sessionRepository.deleteByRefreshToken(refreshToken);
            throw new UnauthorizedException('Refresh token expired');
        }

        return session;
    }

    async revokeSession(refreshToken: string): Promise<void> {
        await this.sessionRepository.deleteByRefreshToken(refreshToken);
    }

    async revokeAllUserSessions(
        userId: string | Types.ObjectId,
    ): Promise<void> {
        await this.sessionRepository.deleteByUserId(userId);
    }

    async assertActiveSessionById(
        sessionId: string | Types.ObjectId,
    ): Promise<void> {
        const normalizedId =
            typeof sessionId === 'string'
                ? new Types.ObjectId(sessionId)
                : sessionId;
        const session = await this.sessionRepository.findOne({
            _id: normalizedId,
        });
        if (!session) {
            throw new UnauthorizedException('Session revoked or not found');
        }
        if (session.expiresAt < new Date()) {
            await this.sessionRepository.deleteByRefreshToken(
                session.refreshToken,
            );
            throw new UnauthorizedException('Session expired');
        }
    }

    async cleanupExpiredSessions(): Promise<void> {
        await this.sessionRepository.deleteExpiredSessions();
    }

    private generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }
}
