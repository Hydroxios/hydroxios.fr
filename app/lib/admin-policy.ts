export function isAdmin(id: unknown, allowedId = process.env.ADMIN_DISCORD_ID): boolean {
  return typeof id === "string" && /^\d{17,20}$/.test(allowedId ?? "") && id === allowedId;
}

export function validWriteOrigin(origin: string | null, siteUrl = process.env.NEXTAUTH_URL): boolean {
  try {
    return !!origin && !!siteUrl && origin === new URL(siteUrl).origin;
  } catch { return false; }
}
