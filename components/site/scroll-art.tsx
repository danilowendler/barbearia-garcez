"use client";

import { useEffect, useRef } from "react";

/**
 * Grava o progresso (0→1) do elemento pela viewport na CSS var --progress.
 * IntersectionObserver liga o listener só quando visível; rAF evita layout
 * thrashing. Com prefers-reduced-motion, fixa 1 (arte pronta, estática).
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--progress", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 = topo do elemento entrando embaixo; 1 = base saindo em cima.
      const passed = vh - rect.top;
      const total = rect.height + vh;
      const p = Math.min(1, Math.max(0, passed / total));
      el.style.setProperty("--progress", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
    io.observe(el);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

const stroke = {
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Hero: tesoura line-art percorre um "fio" tracejado e o corta —
 * o traço se desenha, a tesoura desliza tesourando (loop de tempo)
 * e a metade cortada do fio cai. Tudo dirigido por --progress.
 */
export function ScissorsCut() {
  const ref = useScrollProgress<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden
      className="scroll-art h-[240px] w-full overflow-hidden text-on-dark md:h-[340px]"
    >
      <svg
        viewBox="0 0 1200 320"
        preserveAspectRatio="xMidYMid meet"
        className="size-full"
      >
        {/* fio — lado que ainda não foi cortado (a tesoura anda sobre ele) */}
        <line
          x1="40"
          y1="160"
          x2="770"
          y2="160"
          {...stroke}
          strokeWidth="2"
          pathLength={1}
          data-draw=""
        />
        {/* fio — metade que cai depois do corte */}
        <g className="cut-line-right">
          <line
            x1="770"
            y1="160"
            x2="1160"
            y2="160"
            {...stroke}
            strokeWidth="2"
            pathLength={1}
            data-draw=""
          />
        </g>

        {/* tesoura (pivô em 150,160) — desliza com o scroll */}
        <g className="cut-scissors" {...stroke} strokeWidth="3">
          {/* peça A: lâmina superior + cabo inferior (rígidos, giram juntos) */}
          <g className="blade-a">
            <path d="M150 160 L320 128" pathLength={1} data-draw="" />
            <path d="M162 147 L320 128" pathLength={1} data-draw="" />
            <path d="M150 160 L116 186" pathLength={1} data-draw="" />
            <ellipse
              cx="93"
              cy="203"
              rx="26"
              ry="16"
              transform="rotate(38 93 203)"
              pathLength={1}
              data-draw=""
              {...stroke}
            />
          </g>
          {/* peça B: lâmina inferior + cabo superior */}
          <g className="blade-b">
            <path d="M150 160 L320 192" pathLength={1} data-draw="" />
            <path d="M162 173 L320 192" pathLength={1} data-draw="" />
            <path d="M150 160 L116 134" pathLength={1} data-draw="" />
            <ellipse
              cx="93"
              cy="117"
              rx="26"
              ry="16"
              transform="rotate(-38 93 117)"
              pathLength={1}
              data-draw=""
              {...stroke}
            />
          </g>
          {/* pivô */}
          <circle
            cx="150"
            cy="160"
            r="5"
            {...stroke}
            strokeWidth="3"
            pathLength={1}
            data-draw=""
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Sobre: máquina de barbear line-art que se desenha ao entrar em cena e
 * flutua suavemente; "pelos" caem ao lado em loop.
 */
export function ClipperArt() {
  const ref = useScrollProgress<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden
      className="scroll-art h-[260px] w-full overflow-hidden text-on-dark md:h-[320px]"
    >
      <svg
        viewBox="0 0 480 320"
        preserveAspectRatio="xMidYMid meet"
        className="size-full"
      >
        <g className="clipper-float" {...stroke} strokeWidth="3">
          {/* corpo */}
          <path
            d="M205 96
               L275 96
               L272 250
               Q272 268 240 268
               Q208 268 208 250
               Z"
            pathLength={1}
            data-draw=""
          />
          {/* cabeça / lâmina com dentes */}
          <path d="M199 96 L281 96 L273 68 L207 68 Z" pathLength={1} data-draw="" />
          {[218, 229, 240, 251, 262].map((x) => (
            <line
              key={x}
              x1={x}
              y1="68"
              x2={x}
              y2="55"
              strokeWidth="2.5"
              pathLength={1}
              data-draw=""
              {...stroke}
            />
          ))}
          {/* botão liga/desliga */}
          <rect
            x="230"
            y="122"
            width="20"
            height="34"
            rx="1"
            pathLength={1}
            data-draw=""
            {...stroke}
          />
          {/* frisos do corpo */}
          <line x1="214" y1="188" x2="266" y2="188" strokeWidth="2" pathLength={1} data-draw="" {...stroke} />
          <line x1="214" y1="202" x2="266" y2="202" strokeWidth="2" pathLength={1} data-draw="" {...stroke} />
          <line x1="214" y1="216" x2="266" y2="216" strokeWidth="2" pathLength={1} data-draw="" {...stroke} />
        </g>

        {/* pelos caindo */}
        <g {...stroke} strokeWidth="2" opacity="0.7">
          <path d="M330 90 q6 8 0 16" className="hair-fall" pathLength={1} />
          <path
            d="M352 120 q-6 8 0 16"
            className="hair-fall"
            style={{ animationDelay: "0.9s" }}
            pathLength={1}
          />
          <path
            d="M148 110 q6 8 0 16"
            className="hair-fall"
            style={{ animationDelay: "0.4s" }}
            pathLength={1}
          />
          <path
            d="M126 150 q-6 8 0 16"
            className="hair-fall"
            style={{ animationDelay: "1.6s" }}
            pathLength={1}
          />
        </g>
      </svg>
    </div>
  );
}
