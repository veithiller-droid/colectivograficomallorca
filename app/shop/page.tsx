import Link from "next/link";
import SiteHeader from "../components/site-header";
import { products } from "../data/products";

export default function ShopPage() {
  return <main><SiteHeader /><section className="shop-intro shell"><p className="eyebrow">Colección</p><h1>Obra gráfica</h1><p>Fine Art Prints creados, seleccionados e impresos en Mallorca.</p></section>
    <section className="catalog-controls shell" aria-label="Filtros de la colección"><button>Todos <span>{products.length}</span></button><button>Artistas</button><button>Formatos</button><select aria-label="Ordenar productos" defaultValue="recent"><option value="recent">Más recientes</option><option value="artist">Artista</option></select></section>
    <section className="catalog shell" aria-label="Diseños disponibles">{products.map(item => <Link className="catalog-card" href={`/shop/${item.slug}`} key={item.slug}><div className="catalog-image"><img src={item.image} alt={`${item.title} — ${item.artist}`} /></div><div className="catalog-meta"><div><h2>{item.title}</h2><p>{item.artist}</p></div><span>ab 3 €</span></div></Link>)}</section>
  </main>;
}
