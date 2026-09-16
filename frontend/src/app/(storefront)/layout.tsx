import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageTransition } from "@/components/ui/PageTransition";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* Mobil tab-panel doim ekran pastida turadi — kontent (va Footer) shu
          balandlikda yashirinib qolmasligi uchun pastdan bo'shliq qo'shiladi. */}
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Har bir marshrutda kontent qaytadan "kirish" animatsiyasi bilan chiqadi */}
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
