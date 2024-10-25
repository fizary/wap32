import { type RezEntry } from "./types";

export function getParentPath(path: string): string {
    const sliceIndex = path.lastIndexOf("/", path.length - 2);
    return sliceIndex >= 0 ? path.slice(0, sliceIndex + 1) : "/";
}

export function getEntryName(entry: RezEntry): string {
    if (entry.type === "file" && entry.extension.length > 0)
        return `${entry.name}.${entry.extension}`;

    return entry.name;
}
