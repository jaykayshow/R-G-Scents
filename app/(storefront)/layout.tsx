import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBanner } from "@/components/sections/promo-banner";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { AuthHydration } from "@/components/providers/auth-hydration";
import { CurrencyHydration } from "@/components/providers/currency-hydration";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CatalogHydration />
      <AuthHydration />
      <CurrencyHydration />
      <PromoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
