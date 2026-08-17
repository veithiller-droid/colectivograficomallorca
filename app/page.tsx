import ParallaxGallery from "./components/parallax-gallery";
import SiteHeader from "./components/site-header";
import Link from "next/link";

export default function Home() {
  return <main>
    <SiteHeader />
    <section id="top" className="hero shell"><div className="hero-copy"><p className="eyebrow">Obra gráfica creada en Mallorca</p><h1>La isla,<br/><i>impresa.</i></h1><p className="intro">Ediciones de artistas que viven y trabajan en Mallorca. Series cortas, impresión cuidada y una mirada contemporánea al Mediterráneo.</p><a className="cta" href="#obra">Descubrir la colección <span>↘</span></a></div><div className="hero-art" aria-label="Composición gráfica mediterránea"><div className="sun"/><div className="arch"/><div className="sea"/><div className="leaf leaf-one"/><div className="leaf leaf-two"/><span className="edition">Edición<br/>01—26</span></div></section>
    <div id="obra"><ParallaxGallery /></div>
    <section id="colectivo" className="manifesto shell"><p className="eyebrow">Who we are</p><p className="statement">Un archivo vivo de la isla a través de quienes la dibujan, la pintan y la interpretan.</p><div className="manifesto-foot"><p>Colectivo Gráfico Mallorca reúne ediciones originales de artistas mallorquines y artistas que han hecho de la isla su hogar.</p><Link href="/who-we-are">Conocer el colectivo →</Link></div></section>
    <section id="que-hacemos" className="what-we-do"><div className="shell"><p className="eyebrow">What we do</p><div className="what-grid"><h2>De la idea<br/>al papel.</h2><div><p>Seleccionamos obra gráfica, trabajamos formatos y acabados y producimos cada edición en Artà.</p><p>Disponible como impresión, enmarcada, con marco a medida o como descarga digital cuando el artista lo autoriza.</p></div></div></div></section>
    <section id="newsletter" className="newsletter"><div className="shell newsletter-inner"><div><p className="eyebrow">Desde el taller</p><h2>Nuevas ediciones,<br/>sin ruido.</h2></div><form><label htmlFor="email">Tu correo electrónico</label><div><input id="email" name="email" type="email" autoComplete="email" placeholder="nombre@correo.com" required/><button type="submit">Suscribirme →</button></div><small>Solo novedades, artistas y lanzamientos.</small></form></div></section>
    <footer className="shell"><div className="brand"><span>COLECTIVO</span><span>GRÁFICO</span><span>MALLORCA</span></div><p><Link href="/privacy">Privacidad</Link> · <Link href="/legal">Aviso legal</Link></p><p>Artà · Mallorca · © 2026</p></footer>
  </main>;
}
