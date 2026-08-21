"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="shell site-footer-inner">
        <div className="brand">
          <span>COLECTIVO</span>
          <span>GRÁFICO</span>
          <span>MALLORCA</span>
        </div>

        <nav aria-label="Information">
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">{t.footer.privacy}</Link>
          <Link href="/legal">{t.footer.legal}</Link>
          <Link href="/returns">{t.footer.returns}</Link>
        </nav>

        <p>Artà · Mallorca · © 2026</p>
      </div>
    </footer>
  );
}
