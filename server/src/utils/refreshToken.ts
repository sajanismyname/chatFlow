import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId: number) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        {
            expiresIn: "15m",
        }
    );
};