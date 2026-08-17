"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const examples = [
  { title: "Capdepera", artist: "Herví Tille", tone: "ochre", mark: "01" },
  { title: "Posidònia", artist: "Blanca", tone: "blue", mark: "02" },
  { title: "Sa Roqueta", artist: "Blanca", tone: "coral", mark: "03" },
  { title: "Mediterrani", artist: "Colectivo", tone: "green", mark: "04" },
];

export default function ParallaxGallery() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = window.innerHeight - rect.top;
      section.style.setProperty("--parallax-slow", `${progress * 0.12}px`);
      section.style.setProperty("--parallax-fast", `${progress * -0.045}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={root} className="parallax-stage" aria-labelledby="gallery-title">
      <div className="edge edge-left" aria-hidden="true"><span className="doodle palm">♠</span><span className="doodle lemon">●</span><span className="doodle waves">≋</span><span className="doodle flower">✽</span></div>
      <div className="scroll-sheet">
        <div className="gallery-heading"><p className="eyebrow">Una primera mirada</p><h2 id="gallery-title">Diseños de la isla</h2><p>Cuatro espacios de muestra. Después, cada obra llegará directamente desde el CMS.</p></div>
        <div className="poster-stream">
          {examples.map((item, index) => <article className={`stream-item stream-${index + 1}`} key={item.title}><div className={`poster ${item.tone}`}><span className="work-no">{item.mark}</span><div className="work-shape" /><p>ILLES BALEARS<br />MEDITERRANI</p></div><div className="stream-caption"><h3>{item.title}</h3><p>{item.artist}</p></div></article>)}
        </div>
        <Link className="shop-link" href="/shop">Ver los 80 diseños <span>→</span></Link>
      </div>
      <div className="edge edge-right" aria-hidden="true"><span className="doodle sunlet">☼</span><span className="doodle boat">⌁</span><span className="doodle olive">❧</span><span className="doodle star">☆</span></div>
    </section>
  );
}
