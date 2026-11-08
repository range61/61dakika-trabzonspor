import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MAIN_NAV, TOOLS_NAV } from "./nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Wordmark />
        </Link>

        <nav aria-label="Ana menü" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="relative rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
                  activeProps={{ "aria-current": "page" }}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && <span className="absolute inset-x-2.5 -bottom-[9px] h-0.5 rounded-full bg-primary" />}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" aria-label="Menüyü aç">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto p-0">
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <SheetTitle>
                <Wordmark />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobil menü" className="px-3 py-3">
              <MobileLink to="/" label="Ana Sayfa" onNavigate={() => setOpen(false)} exact />
              {MAIN_NAV.map((i) => (
                <MobileLink key={i.to} to={i.to} label={i.label} onNavigate={() => setOpen(false)} />
              ))}
              <p className="eyebrow mt-5 px-3 pb-1">Araçlar</p>
              {TOOLS_NAV.map((i) => (
                <MobileLink key={i.to} to={i.to} label={i.label} onNavigate={() => setOpen(false)} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function MobileLink({
  to,
  label,
  onNavigate,
  exact,
}: {
  to: (typeof MAIN_NAV)[number]["to"];
  label: string;
  onNavigate: () => void;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact }}
      activeProps={{ "aria-current": "page" }}
      className="flex items-center rounded-md px-3 py-2.5 text-[0.95rem] font-medium text-foreground hover:bg-muted data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
    >
      {label}
    </Link>
  );
}