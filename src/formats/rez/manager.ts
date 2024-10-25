import { BinaryStream, decode } from "hexcod";
import { reverseString } from "@/utils/strings";
import { getEntryName } from "./utils";
import type { RezHeader, RezEntry, RezDirectory, RezFile } from "./types";

enum EntryType {
    FILE = 0,
    DIRECTORY = 1,
}

type BaseEntry = {
    _entryOffset: number;
    _entrySize: number;
    _contentOffset: number;
    _contentSize: number;
};

type _RezDirectory = BaseEntry & RezDirectory & {
    content?: _RezEntry[];
};

type _RezFile = BaseEntry & RezFile;
type _RezEntry = _RezDirectory | _RezFile;

export class RezManager {
    private _cache!: Map<string, _RezEntry>;
    private _stream!: BinaryStream;
    private _root!: _RezDirectory;
    header!: RezHeader;

    constructor(stream?: BinaryStream) {
        this.init(stream);
    }

    init(stream?: BinaryStream): void {
        this._cache = new Map();
        this._stream = stream || new BinaryStream(new ArrayBuffer(0));
        
        if (stream !== undefined) {
            this._stream.seek(0);

            const description = this._stream.read("u8", 127);
            const header = this._stream.read("u32", 10);
            const isSorted = this._stream.read("u8");

            this._root = {
                _entryOffset: -1,
                _entrySize: -1,
                _contentOffset: header[1],
                _contentSize: header[2],
                type: "directory",
                name: "",
                lastModified: new Date(header[3] * 1000),
                content: undefined,
            };

            this.header = {
                signature: decode(description.subarray(2, 62)),
                userTitle: decode(description.subarray(64, 124)),
                version: header[0],
                nextWriteOffset: header[4],
                lastModified: new Date(header[5] * 1000),
                largestKeyArray: header[6],
                largestDirNameSize: header[7],
                largestFileNameSize: header[8],
                largestCommentSize: header[9],
                isSorted: Boolean(isSorted),
            };
        } else {
            this._root = {
                _entryOffset: -1,
                _entrySize: -1,
                _contentOffset: 0,
                _contentSize: 0,
                type: "directory",
                name: "",
                lastModified: new Date(),
                content: undefined,
            };

            this.header = {
                signature: "RezMgr Version 1 Copyright (C) 1995 MONOLITH INC.",
                userTitle: "",
                version: 1,
                nextWriteOffset: 0,
                lastModified: new Date(),
                largestKeyArray: 0,
                largestDirNameSize: 0,
                largestFileNameSize: 0,
                largestCommentSize: 0,
                isSorted: false,
            };
        }
    }

    getEntry(targetPath: string, includeContent: false): RezEntry | undefined;
    getEntry(targetPath: string, includeContent?: true): Required<RezEntry> | undefined;
    getEntry(targetPath: string, includeContent = true): RezEntry | Required<RezEntry> | undefined {
        if (targetPath === undefined || targetPath === "")
            return undefined;

        let entry: _RezEntry | undefined;
        const fullPath = `/${targetPath}/`.replace(/\/{2,}/g, "/");
        let path = fullPath;

        // Try to find entry in cache
        while (path != "/") {
            entry = this._cache.get(path);

            if (entry !== undefined)
                break;

            const sliceIndex = path.lastIndexOf("/", path.length - 2);
            path = sliceIndex >= 0 ? path.slice(0, sliceIndex + 1) : "/";
        }

        // Get root if no entry was found in cache
        if (entry === undefined)
            entry = this._root;

        // Traverse archive to resolve unmatched path
        let unmatchedPath: string[] | string = fullPath.slice(path.length, -1);
        unmatchedPath = unmatchedPath.length > 0 ? unmatchedPath.split("/") : [];

        for (let x = 0; x < unmatchedPath.length; x++) {
            let nextEntry: _RezEntry | undefined = undefined;
            const content = this._getDirectoryContent(entry._contentOffset, entry._contentSize);

            // Link content to entry
            entry.content = content;

            // Loop through content to find entry for unmatched path, cache all content entries
            for (let y = 0; y < content.length; y++) {
                const entryName = getEntryName(content[y]);

                this._cache.set(`${path}${entryName}/`, content[y]);

                if (entryName === unmatchedPath[x])
                    nextEntry = content[y];
            }

            // Return undefined when entry we were looking for was not found
            if (nextEntry === undefined)
                return undefined;

            // Update entry and path
            entry = nextEntry;
            path = `${path}${getEntryName(nextEntry)}/`;
        }

        // Get entry content
        if (includeContent && entry.content === undefined) {
            if (entry.type === "directory") {
                entry.content = this._getDirectoryContent(entry._contentOffset, entry._contentSize);

                // Save entry content to cache
                for (let x = 0; x < entry.content.length; x++)
                    this._cache.set(`${path}${getEntryName(entry.content[x])}/`, entry.content[x]);
            } else
                entry.content = this._getFileContent(entry._contentOffset, entry._contentSize);
        }

        return entry;
    }

    private _getDirectoryEntry(entryOffset: number): _RezDirectory {
        this._stream.seek(entryOffset + 4);

        const data = this._stream.read("u32", 3);
        const name = decode(this._stream.read("u8", this._stream.view.indexOf(0, this._stream.offset) - this._stream.offset + 1));

        return {
            _entryOffset: entryOffset,
            _entrySize: 17 + name.length,
            _contentOffset: data[0],
            _contentSize: data[1],
            type: "directory",
            name: name,
            lastModified: new Date(data[2] * 1000),
            content: undefined,
        };
    }

    private _getFileEntry(entryOffset: number): _RezFile {
        this._stream.seek(entryOffset + 4);

        const data = this._stream.read("u32", 6);
        const name = decode(this._stream.read("u8", this._stream.view.indexOf(0, this._stream.offset) - this._stream.offset + 1));
        const comment = decode(this._stream.read("u8", this._stream.view.indexOf(0, this._stream.offset) - this._stream.offset + 1));
        const keys = data[5] > 0 ? this._stream.read("u32", data[5]) : [];

        return {
            _entryOffset: entryOffset,
            _entrySize: 30 + name.length + comment.length + keys.length * 4,
            _contentOffset: data[0],
            _contentSize: data[1],
            type: "file",
            id: data[3],
            name: name,
            extension: reverseString(decode(data.subarray(4, 5))),
            comment: comment,
            keys: [...keys],
            lastModified: new Date(data[2] * 1000),
            content: undefined,
        };
    }

    private _getDirectoryContent(contentOffset: number, contentSize: number): _RezEntry[] {
        const entries = [] as _RezEntry[];
        const maxOffset = contentOffset + contentSize;

        this._stream.seek(contentOffset);

        while (this._stream.offset < maxOffset) {
            const type = this._stream.read("u32");

            if (type === EntryType.DIRECTORY)
                entries.push(this._getDirectoryEntry(this._stream.offset - 4));
            else if (type === EntryType.FILE)
                entries.push(this._getFileEntry(this._stream.offset - 4));
            else
                throw new Error(`Unknown entry type ${type} at offset ${this._stream.offset - 4}`);
        }

        return entries;
    }

    private _getFileContent(contentOffset: number, contentSize: number): BinaryStream {
        this._stream.seek(contentOffset);
        return this._stream.substream(contentSize);
    }
}
