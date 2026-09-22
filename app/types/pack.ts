import type { Loader } from "."

export interface Pack {
    id: string
    name: string
    version: string
    minecraft: string
    loader: Loader
    archive: Archive
}

interface Archive {
    url: string
    sha256: string
    size: number
}
