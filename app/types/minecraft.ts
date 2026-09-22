import type { Loader } from "."

interface MinecraftProjectBase {
    id: string
    name: string
    icon?: string
    version: string
    description?: string
    demo?: boolean
    minecraft: string
    download?: string
    loader: Loader
}

export interface Mod extends MinecraftProjectBase {
    type: "mod"
}

export interface Plugin extends MinecraftProjectBase {
    type: "plugin"
}

export type MinecraftProject = Mod | Plugin
