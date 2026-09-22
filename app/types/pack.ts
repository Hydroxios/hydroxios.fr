import type { Loader } from "."

export interface Pack {
    id: string
    name: string
    icon?: string
    version: string
    description?: string
    demo?: boolean
    minecraft: string
    loader: Loader
    archive: Archive
}

interface Archive {
    url: string
    sha256?: string
    size?: number
}
