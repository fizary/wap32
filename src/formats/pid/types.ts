export type PidHeader = {
    id: number;
    flags: number;
    width: number;
    height: number;
    x: number;
    y: number;
    userValue1: number;
    userValue2: number;
};

export type PidData = {
    header: PidHeader;
    pixelData: Uint8Array;
    palette?: Uint8Array;
};
