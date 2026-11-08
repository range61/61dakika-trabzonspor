import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Flag,
  GitCompareArrows,
  IdCard,
  LayoutGrid,
  Newspaper,
  PenTool,
  Shield,
  Target,
  Trophy,
  Users,
} from "lucide-react";

export interface NavItem {
  to:
    | "/"
    | "/haberler"
    | "/maclar"
    | "/takvim"
    | "/puan-durumu"
    | "/kadro"
    | "/istatistikler"
    | "/kulup"
    | "/araclar"
    | "/ilk-11"
    | "/taktik"
    | "/skor-tahmini"
    | "/oyuncu-karti"
    | "/karsilastir";
  label: string;
  description: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { to: "/haberler", label: "Haberler", description: "Kaynaklı son haberler", icon: Newspaper },
  { to: "/maclar", label: "Maçlar", description: "Fikstür, sonuçlar, maç merkezi", icon: Flag },
  { to: "/takvim", label: "Takvim", description: "Aylık maç takvimi", icon: CalendarDays },
  { to: "/puan-durumu", label: "Puan Durumu", description: "Süper Lig tablosu", icon: Trophy },
  { to: "/kadro", label: "Kadro", description: "Oyuncular ve mevkiler", icon: Users },
  { to: "/istatistikler", label: "İstatistikler", description: "Takım ve oyuncu verileri", icon: BarChart3 },
  { to: "/kulup", label: "Kulüp", description: "Sezon özeti ve kulüp", icon: Shield },
  { to: "/araclar", label: "Araçlar", description: "Taraftar araçları", icon: LayoutGrid },
];

export const TOOLS_NAV: NavItem[] = [
  { to: "/ilk-11", label: "İlk 11 Oluşturucu", description: "Kadronu kur, görselini indir", icon: ClipboardList },
  { to: "/taktik", label: "Taktik Ekranı", description: "Diz, çiz, görsel olarak indir", icon: PenTool },
  { to: "/skor-tahmini", label: "Skor Tahmini", description: "Maç günü tahminini görsele dök", icon: Target },
  { to: "/oyuncu-karti", label: "Oyuncu Kartı", description: "Kendi oyuncu kartını tasarla", icon: IdCard },
  { to: "/karsilastir", label: "Oyuncu Karşılaştırma", description: "İki oyuncuyu yan yana kıyasla", icon: GitCompareArrows },
];