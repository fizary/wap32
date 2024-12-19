import { BinaryStream } from "hexcod";

export type RezHeader = {
    signature: string;
    userTitle: string;
    version: number;
    nextWriteOffset: number;
    lastModified: Date;
    largestKeyArray: number;
    largestDirNameSize: number;
    largestFileNameSize: number;
    largestCommentSize: number;
    isSorted: boolean;
};

export type RezDirectory = {
    readonly type: "directory";
    name: string;
    lastModified: Date;
    content?: RezEntry[];
};

export type RezFile = {
    readonly type: "file";
    id: number;
    name: string;
    extension: string;
    comment: string;
    keys: number[];
    lastModified: Date;
    content?: BinaryStream;
};

export type RezEntry = RezDirectory | RezFile;
