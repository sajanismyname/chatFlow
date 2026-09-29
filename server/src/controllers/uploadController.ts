import type { Request, Response } from "express";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "text/plain": ".txt",
};

const hasValidSignature = (buffer: Buffer, mimeType: string): boolean => {
    const startsWith = (...bytes: number[]) =>
        bytes.every((byte, index) => buffer[index] === byte);

    switch (mimeType) {
        case "image/jpeg":
            return startsWith(0xff, 0xd8, 0xff);
        case "image/png":
            return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
        case "image/gif":
            return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
        case "image/webp":
            return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
                buffer.subarray(8, 12).toString("ascii") === "WEBP";
        case "application/pdf":
            return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
        case "application/zip":
            return startsWith(0x50, 0x4b, 0x03, 0x04) ||
                startsWith(0x50, 0x4b, 0x05, 0x06) ||
                startsWith(0x50, 0x4b, 0x07, 0x08);
        case "image/heic":
        case "image/heif": {
            const brand = buffer.subarray(8, 12).toString("ascii");
            return buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
                ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
        }
        default:
            return false;
    }
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

        if (!allowedTypes[mimeType]) {
            res.status(400).json({
                message: "Unsupported file type",
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

        if (buffer.length === 0) {
            res.status(400).json({
                message: "Empty files are not allowed",
            });
            return;
        }

        if (buffer.length > MAX_FILE_SIZE) {
            res.status(413).json({
                message: "Files must be 10 MB or smaller",
            });
            return;
        }

        /*
         * Verify the actual file signature.
         *
         * text/plain does not have a reliable magic number,
         * so it is handled separately.
         */
        if (mimeType !== "text/plain") {
            if (!hasValidSignature(buffer, mimeType)) {
                res.status(400).json({
                    message: "File content does not match its declared type",
                });
                return;
            }
        }

        await mkdir(uploadDirectory, { recursive: true });

        // Extension comes ONLY from our trusted MIME map.
        const extension = allowedTypes[mimeType];

        // Never use the client's filename for the stored filename.
        const storedName = `${crypto.randomUUID()}${extension}`;

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