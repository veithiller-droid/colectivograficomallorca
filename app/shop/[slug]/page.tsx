import SiteHeader from "../../components/site-header";
import { products } from "../../data/products";
import ProductView from "./product-view";

export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug) ?? products[0];
  return <main><SiteHeader /><ProductView product={product} /></main>;
}
