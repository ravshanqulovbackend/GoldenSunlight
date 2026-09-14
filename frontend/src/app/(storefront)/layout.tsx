import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/ui/PageTransition";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Har bir marshrutda kontent qaytadan "kirish" animatsiyasi bilan chiqadi */}
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
