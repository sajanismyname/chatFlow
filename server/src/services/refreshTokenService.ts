import crypto from "crypto"
import { AppDataSource } from "../config/dataSource.js";
import { RefreshToken } from "../entities/refreshToken.js";

const refreshTokenRepository =
    AppDataSource.getRepository(RefreshToken);

export const createRefreshToken = async (userId: number) => {
    const rawToken = crypto.randomBytes(64).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const refreshToken = refreshTokenRepository.create({
        tokenHash,
        userId,
        expiresAt,
        revokedAt: null,
    });

    await refreshTokenRepository.save(refreshToken);

    return {
        rawToken,
        expiresAt,
    };
}