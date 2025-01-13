import { BinaryStream } from "hexcod";
import { decodeRlePixels, decodePackedPixels } from "./utils";
import type { PidData } from "./types";

export const PID_FLAGS = {
    TRANSPARENT: 0x01,                  // first index of pixel data should be set as transparentIndex
    USE_VIDEO_MEMORY: 0x02,             // ?use video memory to store image data
    USE_SYSTEM_MEMORY: 0x04,            // ?use system memory to store image data
    MIRROR: 0x08,                       // flip image horizontally
    INVERT: 0x10,                       // flip image vertically
    RLE_COMPRESSION: 0x20,              // run-length pixel data encoding is used
    USE_LIGHT_EFFECTS: 0x40,            // ?unknown
    EMBEDDED_PALETTE: 0x80,             // palette is embedded as last 768 bytes of the buffer
    KEYINDEX: 0x100,                    // transparentIndex should be taken from lower 16 bits of userValue1
    // UNKNOWN1: 0x200,                 // unknown, used only in gruntz
};

export function parsePid(
    stream: BinaryStream,
    size: number,
): PidData {
    const [id, flags, width, height, x, y, userValue1, userValue2] = stream.read("i32", 8);
    const hasEmbeddedPalette = flags & PID_FLAGS.EMBEDDED_PALETTE;
    const hasRLECompression = flags & PID_FLAGS.RLE_COMPRESSION;
    const packedData = stream.read("u8", hasEmbeddedPalette ? size - 32 - 768 : size - 32);
    const transparentIndex = flags & PID_FLAGS.KEYINDEX ? userValue1 & 0xFFFF : 0;

    return {
        header: {
            id,
            flags,
            width,
            height,
            x,
            y,
            userValue1,
            userValue2,
        },
        pixelData: hasRLECompression ? decodeRlePixels(packedData, width, height, transparentIndex) : decodePackedPixels(packedData, width, height),
        palette: hasEmbeddedPalette ? stream.read("u8", 768) : undefined,
    };
}
