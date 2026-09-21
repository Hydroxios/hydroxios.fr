"use client";

import { useEffect, useState } from "react";

const CHANNEL = "hydroxios";
const DESKTOP_QUERY = "(min-width: 768px)";

export default function TwitchEmbed() {
  const [parent, setParent] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const syncChat = () => setShowChat(media.matches);
    const frame = window.requestAnimationFrame(() => {
      setParent(window.location.hostname || "localhost");
      syncChat();
    });

    media.addEventListener("change", syncChat);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", syncChat);
    };
  }, []);

  if (!parent) {
    return (
      <div className="grid aspect-video w-full place-items-center border border-white/15 bg-black/70" aria-label="Chargement du lecteur Twitch">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span className="size-2 animate-pulse rounded-full bg-violet-400 motion-reduce:animate-none" />
          Chargement du lecteur Twitch
        </div>
      </div>
    );
  }

  const playerUrl = `https://player.twitch.tv/?channel=${CHANNEL}&parent=${parent}&autoplay=false&muted=false`;
  const chatUrl = `https://www.twitch.tv/embed/${CHANNEL}/chat?parent=${parent}&darkpopout`;

  return (
    <div className="relative w-full" aria-label="Twitch de Hydroxios">
      <div className={`grid w-full min-w-0 gap-px overflow-hidden border border-white/15 bg-white/15 shadow-2xl shadow-violet-950/30 ${showChat ? "md:grid-cols-[minmax(0,1280px)_minmax(300px,360px)]" : "grid-cols-1"}`}>
        <div className="relative aspect-video min-w-0 bg-black">
          <iframe src={playerUrl} title="Lecteur Twitch de Hydroxios" width="100%" height="100%" allow="autoplay; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
        </div>
        {showChat ? (
          <div className="relative min-h-[360px] min-w-0 bg-[#0e0e10]">
            <iframe src={chatUrl} title="Chat Twitch de Hydroxios" width="100%" height="100%" allow="clipboard-write" className="absolute inset-0 h-full w-full border-0" />
          </div>
        ) : null}
      </div>
      {!showChat ? (
        <a href={`https://www.twitch.tv/popout/${CHANNEL}/chat?popout=`} target="_blank" rel="noreferrer" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border border-violet-300/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-100 transition-colors hover:border-violet-300/60 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 md:hidden">
          Ouvrir le chat <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}
