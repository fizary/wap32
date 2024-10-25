import { type RezEntry } from "./types";

export function getEntryName(entry: RezEntry): string {
    if (entry.type === "file" && entry.extension.length > 0)
        return `${entry.name}.${entry.extension}`;

    return entry.name;
}
