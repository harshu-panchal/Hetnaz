import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";

interface PromoBannerProps {
  title: string;
  badge?: string;
  imageUrl?: string;
}

export const PromoBanner = ({
  title,
  badge = "LIMITED OFFER",
}: PromoBannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-[#1e1b4b] p-5 text-white shadow-xl shadow-pink-500/15 border border-pink-300/30 group">
      {/* Glow Effects & Ambience */}
      <div className="absolute -top-12 -right-12 size-40 bg-pink-400/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 size-40 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Gold Watermark */}
      <div className="absolute -right-2 -bottom-6 pointer-events-none select-none opacity-20 group-hover:scale-105 transition-transform duration-500">
        <MaterialSymbol
          name="savings"
          size={130}
          filled
          className="text-white"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-2 max-w-[82%]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-amber-300 text-[10px] font-black uppercase tracking-wider w-fit shadow-2xs">
          <MaterialSymbol
            name="local_fire_department"
            size={13}
            filled
            className="text-amber-300"
          />
          <span>{badge}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black leading-tight text-white drop-shadow-sm">
          {title}
        </h3>
        <p className="text-xs text-white/85 font-medium leading-relaxed">
          Instant coin activation with 100% bonus value for chats, gifts & video
          calls!
        </p>
      </div>
    </div>
  );
};
