import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { UserProvider } from "@/providers/user-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Navbar />
      {/* Su telefono lo spazio in fondo lascia libera la barra di navigazione fissa. */}
      <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <MobileTabBar />
    </UserProvider>
  );
}
