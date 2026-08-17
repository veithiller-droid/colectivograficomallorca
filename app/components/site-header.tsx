import Link from "next/link";

export default function SiteHeader() {
  return <header className="nav shell"><Link className="brand" href="/" aria-label="Colectivo Gráfico Mallorca – Inicio"><span>COLECTIVO</span><span>GRÁFICO</span><span>MALLORCA</span></Link><nav aria-label="Navegación principal"><Link href="/shop">Obra</Link><Link href="/#colectivo">El colectivo</Link><Link href="/#que-hacemos">Qué hacemos</Link><Link href="/#newsletter">Newsletter</Link><button className="bag" aria-label="Abrir cesta">Bolsa <b>0</b></button></nav></header>;
}
