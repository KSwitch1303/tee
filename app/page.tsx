"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FloatingThing = {
  id: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  rotation: number;
  emoji: string;
};

type FallingThing = {
  id: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  emoji: string;
};

type PopThing = {
  id: string;
  angle: number;
  distance: number;
  size: number;
  emoji: string;
  duration: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

export default function Home() {
  const [stage, setStage] = useState<"ask" | "yes">("ask");
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [confetti, setConfetti] = useState<FallingThing[]>([]);
  const [popPieces, setPopPieces] = useState<PopThing[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const popTimeoutRef = useRef<number | null>(null);
  const noCooldownRef = useRef<number | null>(null);

  const floating = useMemo<FloatingThing[]>(() => {
    const emojis = ["💗", "💞", "💘", "💝", "🌹", "✨"];
    const count = isMobile ? 22 : 16;
    return Array.from({ length: count }).map((_, index) => ({
      id: createId(`float-${index}`),
      left: Math.random() * 100,
      top: 5 + Math.random() * 90,
      size: (isMobile ? 18 : 14) + Math.round(Math.random() * (isMobile ? 24 : 22)),
      opacity: (isMobile ? 0.35 : 0.22) + Math.random() * 0.4,
      duration: 6 + Math.random() * 7,
      delay: Math.random() * 2,
      rotation: -18 + Math.random() * 36,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]!,
    }));
  }, [isMobile]);

  const noTaunts = [
    "",
    "It's a prank abi?",
    "Oya let's stop playing... Say yes",
    "WOMANNNNNNNNN",
    "My Lovee please say yes😥",
    "Megamisamaaaaa, Onegaiiiiiii",
    "C'mon baby girl",
    "You kuku no get choice, press yes jor",
  ];

  const moveNo = (increment = true) => {
    const arena = arenaRef.current;
    const noBtn = noRef.current;
    const yesBtn = yesRef.current;
    if (!arena || !noBtn || !yesBtn) return;

    const arenaRect = arena.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const padding = 12;
    const maxX = Math.max(padding, arenaRect.width - btnRect.width - padding);
    const maxY = Math.max(padding, arenaRect.height - btnRect.height - padding);

    const yesX = yesRect.left - arenaRect.left;
    const yesY = yesRect.top - arenaRect.top;

    const yesBox = {
      x: yesX - 12,
      y: yesY - 12,
      w: yesRect.width + 24,
      h: yesRect.height + 24,
    };

    let x = 0;
    let y = 0;
    let attempts = 0;
    do {
      x = Math.round(padding + Math.random() * (maxX - padding));
      y = Math.round(padding + Math.random() * (maxY - padding));
      attempts += 1;
    } while (
      attempts < 12 &&
      x < yesBox.x + yesBox.w &&
      x + btnRect.width > yesBox.x &&
      y < yesBox.y + yesBox.h &&
      y + btnRect.height > yesBox.y
    );

    setNoPos({ x, y });
    if (increment) setNoCount((c) => c + 1);
  };

  const triggerNo = () => {
    const now = Date.now();
    if (noCooldownRef.current && now - noCooldownRef.current < 220) return;
    noCooldownRef.current = now;
    moveNo();
  };

  const positionNoNearYes = () => {
    const arena = arenaRef.current;
    const yesBtn = yesRef.current;
    const noBtn = noRef.current;
    if (!arena || !yesBtn || !noBtn) return;

    const arenaRect = arena.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    const padding = 12;
    const yesX = yesRect.left - arenaRect.left;
    const yesY = yesRect.top - arenaRect.top;

    const x = clamp(yesX + yesRect.width + 12, padding, arenaRect.width - noRect.width - padding);
    const y = clamp(yesY, padding, arenaRect.height - noRect.height - padding);
    setNoPos({ x: Math.round(x), y: Math.round(y) });
  };

  useEffect(() => {
    positionNoNearYes();
    const onResize = () => positionNoNearYes();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile || stage !== "ask") return;
    const id = window.setInterval(() => moveNo(false), 2200);
    return () => window.clearInterval(id);
  }, [isMobile, stage]);

  useEffect(() => {
    return () => {
      if (popTimeoutRef.current) window.clearTimeout(popTimeoutRef.current);
    };
  }, []);

  const sayYes = () => {
    setStage("yes");
    const emojis = ["💗", "💞", "💘", "💝", "🌹", "✨", "🍫"];
    const next = Array.from({ length: 36 }).map((_, index) => ({
      id: createId(`fall-${index}`),
      left: Math.random() * 100,
      size: 16 + Math.round(Math.random() * 28),
      duration: 4.6 + Math.random() * 4.8,
      delay: Math.random() * 1.6,
      rotation: -45 + Math.random() * 90,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]!,
    }));
    setConfetti(next);
    const burst = Array.from({ length: 26 }).map((_, index) => ({
      id: createId(`pop-${index}`),
      angle: Math.random() * Math.PI * 2,
      distance: 80 + Math.random() * 120,
      size: 14 + Math.round(Math.random() * 20),
      emoji: emojis[Math.floor(Math.random() * emojis.length)]!,
      duration: 0.85 + Math.random() * 0.45,
    }));
    setPopPieces(burst);
    if (popTimeoutRef.current) window.clearTimeout(popTimeoutRef.current);
    popTimeoutRef.current = window.setTimeout(() => setPopPieces([]), 1400);
  };

  const reset = () => {
    setStage("ask");
    setNoCount(0);
    setConfetti([]);
    requestAnimationFrame(() => positionNoNearYes());
  };

  const taunt = noTaunts[Math.min(noCount, noTaunts.length - 1)]!;

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(1200px_800px_at_15%_10%,#ff4d8d22,transparent_60%),radial-gradient(900px_700px_at_85%_15%,#7c3aed26,transparent_55%),radial-gradient(1100px_900px_at_50%_90%,#fb718526,transparent_55%),linear-gradient(180deg,#09090b, #0b1020 55%, #09090b)]">
      <div className="pointer-events-none absolute inset-0 z-0">
        {floating.map((t) => (
          <span
            key={t.id}
            className="v-float absolute select-none"
            style={{
              left: `${t.left}%`,
              top: `${t.top}%`,
              fontSize: `${t.size}px`,
              opacity: t.opacity,
              transform: `rotate(${t.rotation}deg)`,
              ["--v-float-dur" as never]: `${t.duration}s`,
              animationDelay: `${t.delay}s`,
              filter: "drop-shadow(0 6px 16px rgba(255, 93, 149, 0.18))",
            }}
          >
            {t.emoji}
          </span>
        ))}
      </div>

      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -right-28 top-28 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-[65%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-xl flex-col items-center justify-center px-4 py-10">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.8)]" />
              Valentine Protocol
            </div>
            <div className="text-xs font-semibold text-white/60">For Tee only</div>
          </div>

          {stage === "ask" ? (
            <div className="mt-6">
              <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-white">
                Tee… I have a very serious question.
              </h1>
              <p className="mt-3 text-pretty text-base leading-7 text-white/75">
                Hello my beautiful, curvy, sexy short queen, you have the kind of beauty that makes a room
                feel softer just because you walked in, your poor eyesight and constant use of glasses are one of my favorite detail (wink wink), but my favourite
                without a doubt (also what I first noticed about you) is you beautiful "Tea-like" skin glow,
                that light‑chocolate warmth that makes me want to get closer and stay there (probably licking, kissing, sniffing and "hugging" you. hehe). Every day
                you make the ordinary feel like a secret I get to keep. (Unlike you that'll always tell your secrets to me the next day #snitch 😂😂)
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white/70">Said serious question:</div>
                <div className="mt-1 text-pretty text-2xl font-extrabold tracking-tight text-white">
                  Will you be my Valentine?👀
                </div>
                <div className="mt-2 text-sm text-white/60">
                  Choose wisely. I have prepared unnecessary levels of romance.
                </div>
              </div>

              <div ref={arenaRef} className="relative mt-7 h-[200px] w-full sm:h-[180px]">
                <button
                  ref={yesRef}
                  type="button"
                  onClick={sayYes}
                  className="v-pulse absolute bottom-3 left-1/2 w-[min(92%,360px)] -translate-x-1/2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-6 py-4 text-lg font-black text-white shadow-[0_18px_60px_-18px_rgba(244,63,94,0.9)] outline-none transition-transform active:scale-[0.99]"
                >
                  YES (obviously)
                </button>

                <button
                  ref={noRef}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerNo();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerNo();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerNo();
                  }}
                  onPointerEnter={() => {
                    if (window.matchMedia("(hover: hover)").matches) triggerNo();
                  }}
                  className="absolute left-0 top-0 touch-none rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-transform active:scale-[0.98]"
                  style={{
                    transform: `translate3d(${noPos.x}px, ${noPos.y}px, 0)`,
                  }}
                >
                  No
                </button>
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="text-sm text-white/70">{taunt}</div>
                <div className="text-xs font-semibold text-white/50 tabular-nums">
                  No attempts: {noCount}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-xs font-semibold text-white/55">Includes</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    Hugs, snacks, and “I love you” spam
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-xs font-semibold text-white/55">Side effects</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    Blushing, giggles, sudden happiness
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-white">
                She said yes.
              </h1>
              <p className="mt-3 text-pretty text-base leading-7 text-white/75">
                Tee, you just made me the luckiest person on the internet. Please accept this
                legally-binding bundle of love, kisses, and extremely embarrassing admiration.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5">
                <div className="text-sm font-semibold text-white/70">Your Valentine perks:</div>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  <li>Unlimited forehead kisses (terms & conditions: you must exist nearby)</li>
                  <li>One (1) dramatic playlist dedicated to Tee</li>
                  <li>Chocolate tribute and/or snack taxes paid on time</li>
                  <li>Me, being obsessed with you in 4K</li>
                  <li>And two more Valentine perks that I can't even think of right now</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white/85 backdrop-blur-md transition-colors hover:bg-white/15 active:scale-[0.99]"
                >
                  Replay the chaos
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs font-semibold text-white/45">
          Made with questionable confidence and a lot of love.
        </div>
      </main>

      {stage === "yes" ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[38%] h-2 w-2 -translate-x-1/2">
            {popPieces.map((piece) => (
              <span
                key={piece.id}
                className="v-pop absolute left-0 top-0 select-none"
                style={{
                  fontSize: `${piece.size}px`,
                  ["--v-pop-x" as never]: `${Math.cos(piece.angle) * piece.distance}px`,
                  ["--v-pop-y" as never]: `${Math.sin(piece.angle) * piece.distance}px`,
                  ["--v-pop-dur" as never]: `${piece.duration}s`,
                  filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
                }}
              >
                {piece.emoji}
              </span>
            ))}
          </div>
          {confetti.map((t) => (
            <span
              key={t.id}
              className="v-fall absolute top-0 select-none"
              style={{
                left: `${t.left}%`,
                fontSize: `${t.size}px`,
                transform: `rotate(${t.rotation}deg)`,
                ["--v-fall-dur" as never]: `${t.duration}s`,
                animationDelay: `${t.delay}s`,
                filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.35))",
              }}
            >
              {t.emoji}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
