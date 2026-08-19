import SiteHeader from "../../components/site-header";
import { products } from "../../data/products";
import ProductView from "./product-view";

export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug) ?? products[0];
  const navigableProducts = products.filter(item => item.image !== null);
  const currentIndex = navigableProducts.findIndex(item => item.slug === product.slug);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const previousProduct = navigableProducts[(safeIndex - 1 + navigableProducts.length) % navigableProducts.length];
  const nextProduct = navigableProducts[(safeIndex + 1) % navigableProducts.length];
  return <main><SiteHeader /><ProductView requestedSlug={slug} product={product} previousProduct={previousProduct} nextProduct={nextProduct} /></main>;
}
