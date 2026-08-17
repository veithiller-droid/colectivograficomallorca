import SiteHeader from "../components/site-header";

const tones = ["ochre", "coral", "blue", "green"];
const catalog = Array.from({ length: 80 }, (_, index) => ({
  id: index + 1,
  title: `Diseño ${String(index + 1).padStart(2, "0")}`,
  artist: index % 3 === 0 ? "Herví Tille" : index % 3 === 1 ? "Blanca" : "Colectivo",
  tone: tones[index % tones.length],
}));

export default function ShopPage() {
  return <main><SiteHeader /><section className="shop-intro shell"><p className="eyebrow">Colección</p><h1>Obra gráfica</h1><p>Ediciones creadas en Mallorca. Seleccionadas y producidas en Artà.</p></section>
    <section className="catalog-controls shell" aria-label="Filtros de la colección"><button>Todos <span>80</span></button><button>Artistas</button><button>Colecciones</button><button>Formatos</button><select aria-label="Ordenar productos" defaultValue="recent"><option value="recent">Más recientes</option><option value="artist">Artista</option></select></section>
    <section className="catalog shell" aria-label="Diseños disponibles">{catalog.map(item => <a className="catalog-card" href={`/shop/${item.id}`} key={item.id}><div className={`catalog-poster ${item.tone}`}><span>{String(item.id).padStart(2, "0")}</span><div className="mini-shape"/><b>COLECTIVO<br/>GRÁFICO<br/>MALLORCA</b></div><div className="catalog-meta"><div><h2>{item.title}</h2><p>{item.artist}</p></div><span>Ver obra ↗</span></div></a>)}</section>
  </main>;
}
