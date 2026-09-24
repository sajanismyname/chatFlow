import type { Request, Response } from "express";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const extensionFromMime = (mimeType: string) => {
    const map: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/heic": ".heic",
        "image/heif": ".heif",
        "application/pdf": ".pdf",
        "text/plain": ".txt",
        "application/zip": ".zip",
    };

    return map[mimeType] ?? "";
};

export const uploadFile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { data, fileName, mimeType } = req.body as {
            data?: string;
            fileName?: string;
            mimeType?: string;
        };

        if (!data || !fileName || !mimeType) {
            res.status(400).json({
                message: "File data, name and type are required",
            });
            return;
        }

        const match = data.match(/^data:[^;]+;base64,(.+)$/s);
        if (!match) {
            res.status(400).json({
                message: "Invalid file data",
            });
            return;
        }

        const buffer = Buffer.from(match[1], "base64");

        if (buffer.length > MAX_FILE_SIZE) {
            res.status(413).json({
                message: "Files must be 10 MB or smaller",
            });
            return;
        }

        await mkdir(uploadDirectory, { recursive: true });

        const safeExtension =
            path.extname(fileName).toLowerCase() ||
            extensionFromMime(mimeType);

        const storedName =
            `${crypto.randomUUID()}${safeExtension}`;

        await writeFile(
            path.join(uploadDirectory, storedName),
            buffer
        );

        res.status(201).json({
            url: `${req.protocol}://${req.get("host")}/uploads/${storedName}`,
            fileName: path.basename(fileName),
            mimeType,
            size: buffer.length,
        });
    } catch (error) {
        console.error("File upload failed:", error);
        res.status(500).json({
            message: "Failed to upload file",
        });
    }
};
