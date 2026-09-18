import crypto from "crypto";
import { Request, Response } from "express";
import { AppDataSource } from "../config/dataSource.js";
import { RefreshToken } from "../entities/refreshToken.js";
import { User } from "../entities/User.js";
import {google} from "googleapis"
import { googleClient } from "../config/google.js";
import { generateAccessToken } from "../utils/jwt.js";
import { createRefreshToken } from "../services/refreshTokenService.js";

const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

export const getUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try{
        const users = await userRepository.find()

        res.status(200).json({
            users,
        });
    } catch (error) {
    console.error(error);

    res.status(500).json({
        message: "Failed to fetch users",
    });
    }
}

export const googleLogin = (
    req: Request,
    res: Response
    ): void => {
    const url = googleClient.generateAuthUrl({
        access_type: "online",
        scope: [
        "openid",
        "profile",
        "email",
        ],
    });

    res.redirect(url);
};

export const googleCallback = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { code } = req.query;

        if (typeof code !== "string") {
            res.status(400).json({
                message: "Authorization code missing",
            });
            return;
        }

        const { tokens } = await googleClient.getToken(code);

        googleClient.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: googleClient,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        if (!data.id) {
            res.status(400).json({
                message: "Google user ID is missing",
            });
            return;
        }

        let user = await userRepository.findOne({
            where: {
                googleId: data.id,
            },
        });

        if (!user) {
            const newUser = userRepository.create({
                googleId: data.id,
                email: data.email!,
                name: data.name!,
                avatar: data.picture,
            });

            user = await userRepository.save(newUser);
        }

        const accessToken = generateAccessToken(user.id);

        const {rawToken} =await createRefreshToken(user.id);

        res.cookie("refreshToken", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect("http://localhost:5173/auth/callback");
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Google authentication failed",
        });
    }
};

export const refreshAccessToken = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const rawToken = req.cookies.refreshToken;

        if (!rawToken) {
            res.status(401).json({
                message: "Refresh token missing",
            });
            return;
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const storedToken = await refreshTokenRepository.findOne({
            where: { tokenHash },
        });

        if (!storedToken) {
            res.status(401).json({
                message: "Invalid refresh token",
            });
            return;
        }

        if (
            storedToken.revokedAt ||
            storedToken.expiresAt < new Date()
        ) {
            res.status(401).json({
                message: "Refresh token invalid or expired",
            });
            return;
        }

        // Revoke old refresh token
        storedToken.revokedAt = new Date();
        await refreshTokenRepository.save(storedToken);

        // Create replacement refresh token
        const { rawToken: newRawToken } =
            await createRefreshToken(storedToken.userId);

        // Replace cookie
        res.cookie("refreshToken", newRawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Create new access token
        const newAccessToken = generateAccessToken(
            storedToken.userId
        );

        res.json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to refresh access token",
        });
    }
};

export const logout = async (
    req:Request,
    res:Response
):Promise<void> =>{
    try {
        const rawToken = req.cookies.refreshToken;

        if(rawToken){
            const tokenHash = crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");

            await refreshTokenRepository.update(
                { tokenHash },
                { revokedAt: new Date() }
            );
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Logout failed",
        });
    }
}