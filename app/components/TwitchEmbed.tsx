"use client";

import { useEffect, useState } from "react";

const CHANNEL = "hydroxios";

export default function TwitchEmbed() {
  const [parent, setParent] = useState("localhost");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setParent(window.location.hostname || "localhost");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const playerUrl = `https://player.twitch.tv/?channel=${CHANNEL}&parent=${parent}&autoplay=false&muted=false`;
  const chatUrl = `https://www.twitch.tv/embed/${CHANNEL}/chat?parent=${parent}&darkpopout`;

  return (
    <section className="relative z-20 w-full isolate" aria-label="Twitch de Hydroxios">
      <div className="grid w-full min-w-0 grid-cols-1 grid-rows-2 gap-0 md:grid-cols-[minmax(0,1280px)_minmax(0,360px)] md:grid-rows-1">
        <div className="relative aspect-video min-w-0 overflow-hidden border border-white/15 bg-black shadow-2xl shadow-violet-950/30">
          <iframe
            key={`player-${parent}`}
            src={playerUrl}
            title="Lecteur Twitch de Hydroxios"
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        <div className="relative aspect-video min-w-0 overflow-hidden border border-white/15 bg-[#0e0e10] shadow-2xl shadow-violet-950/30 md:aspect-auto">
          <iframe
            key={`chat-${parent}`}
            src={chatUrl}
            title="Chat Twitch de Hydroxios"
            width="100%"
            height="100%"
            allow="clipboard-write"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
