export function decodeRlePixels(packedData: Uint8Array, width: number, height: number, transparentIndex: number): Uint8Array {
    const destBuffer = new Uint8Array(width * height);
    let x = 0, y = 0;
    let offset = 0;

    while (y < height) {
        const rowOffset = y * width;

        if (packedData[offset] & 0x80) { // Transparent run (high bit set)
            const runLength = packedData[offset++] - 0x80;

            for (let i = 0; i < runLength; i++)
                destBuffer[rowOffset + x++] = transparentIndex;
        } else { // Raw data run
            const runLength = packedData[offset++];

            for (let i = 0; i < runLength; i++)
                destBuffer[rowOffset + x++] = packedData[offset + i];

            offset += runLength;
        }

        if (x >= width) { // Move to next row if we reach the end of a scanline
            x = 0;
            y++;
        }
    }

    return destBuffer;
}

export function decodePackedPixels(packedData: Uint8Array, width: number, height: number): Uint8Array {
    const destBuffer = new Uint8Array(width * height);
    let srcOffset = 0;
    let destOffset = 0;

    for (let y = 0; y < height; y++) {
        let pixelsRemaining = width;

        while (pixelsRemaining > 0) {
            const controlByte = packedData[srcOffset++];

            if ((controlByte & 0xC0) === 0xC0) { // Run-length encoding (2 high bits are set)
                const runLength = controlByte & 0x3F; // Get lower 6 bits
                const index = packedData[srcOffset++];

                for (let i = 0; i < runLength; i++)
                    destBuffer[destOffset++] = index;

                pixelsRemaining -= runLength;
            } else { // Single pixel
                destBuffer[destOffset++] = controlByte;
                pixelsRemaining--;
            }
        }
    }

    return destBuffer;
}
