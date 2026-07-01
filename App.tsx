import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Image as ImageIcon, RotateCcw, Sparkles, UploadCloud, Wand2, Download } from "lucide-react";
import { extractPalette, extractPaletteFromUrl, type Swatch } from "./paletteExtractor";
import { downloadPaletteAsPng } from "./paletteImage";
import { getGridInsights } from "./instagramTips";

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
  }
}

const demoPalette: Swatch[] = [
  { hex: "#2B3A55", name: "Twilight Navy" },
  { hex: "#C6FF00", name: "Citron Spark" },
  { hex: "#E8C5A0", name: "Sanded Almond" },
  { hex: "#7A2E3A", name: "Mulberry Wine" },
  { hex: "#F4F1EA", name: "Linen Mist" },
];

const galleryPalettes: { source: string; swatches: Swatch[] }[] = [
  {
    source: "Coastal dawn, Big Sur",
    swatches: [
      { hex: "#1F2A33", name: "Slate Tide" },
      { hex: "#9DB4C0", name: "Sea Glass" },
      { hex: "#F1E3D3", name: "Driftwood" },
      { hex: "#D98E73", name: "Bluff Clay" },
    ],
  },
  {
    source: "Autumn market, Kyoto",
    swatches: [
      { hex: "#3A1F12", name: "Roast Bean" },
      { hex: "#C66B3D", name: "Persimmon" },
      { hex: "#E8D5A0", name: "Rice Paper" },
      { hex: "#6B8E4E", name: "Moss Path" },
    ],
  },
  {
    source: "Neon alley, Tokyo",
    swatches: [
      { hex: "#0D0D12", name: "Ink Alley" },
      { hex: "#FF2E63", name: "Sign Pink" },
      { hex: "#00C2A8", name: "Teal Glow" },
      { hex: "#F5F5F0", name: "Vapor" },
    ],
  },
  {
    source: "Desert bloom, Joshua Tree",
    swatches: [
      { hex: "#6B5A42", name: "Earth Brown" },
      { hex: "#E8A33D", name: "Sun Quartz" },
      { hex: "#F2EDE6", name: "Bleached Sand" },
      { hex: "#8A3D5B", name: "Prickly Pear" },
    ],
  },
  {
    source: "Foggy forest, Olympic",
    swatches: [
      { hex: "#1A2620", name: "Pine Shadow" },
      { hex: "#4A6B52", name: "Fern Hollow" },
      { hex: "#C2C9B6", name: "Lichen" },
      { hex: "#E8E6D8", name: "Mist" },
    ],
  },
  {
    source: "Riviera terrace, Amalfi",
    swatches: [
      { hex: "#0F4C5C", name: "Deep Tyrrhenian" },
      { hex: "#F4A261", name: "Terracotta" },
      { hex: "#E9C46A", name: "Lemon Rind" },
      { hex: "#F7F6F2", name: "Stucco" },
    ],
  },
];

function useRevealOnMount() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gsap = window.gsap;
    if (prefersReduced || !gsap) {
      document.querySelectorAll(".ps-reveal").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(".ps-reveal", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.1,
      });
    });
    return () => ctx.revert();
  }, []);
}

function useScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (prefersReduced || !gsap || !ST) {
      document.querySelectorAll(".ps-grid-item").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }
    gsap.registerPlugin(ST);
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".ps-grid-item").forEach((el: HTMLElement) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    });
    return () => ctx.revert();
  }, []);
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ps-line)]/70 bg-[var(--ps-paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[var(--ps-ink)]">
            <span className="block h-3 w-3 rounded-[2px] bg-[var(--ps-citron)]" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">PaletteSnap</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-[var(--ps-muted)] md:flex">
          <a href="#how" className="transition-colors hover:text-[var(--ps-ink)]">How it works</a>
          <a href="#gallery" className="transition-colors hover:text-[var(--ps-ink)]">Gallery</a>
        </nav>
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ps-ink)] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Get a palette <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

function usePaletteUpload() {
  const [swatches, setSwatches] = useState<Swatch[]>(demoPalette);
  const [fileName, setFileName] = useState("sunset_rooftop.jpg");
  const [isDemo, setIsDemo] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setError("That doesn't look like an image. Try a JPG, PNG, or WebP.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const extracted = await extractPalette(file, 5);
      setSwatches(extracted);
      setFileName(file.name);
      setIsDemo(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong reading that image.");
    }
  };

  const resetToDemo = () => {
    setSwatches(demoPalette);
    setFileName("sunset_rooftop.jpg");
    setIsDemo(true);
    setStatus("idle");
    setError(null);
  };

  return { swatches, fileName, isDemo, status, error, setStatus, setError, handleFile, resetToDemo };
}

type PaletteUpload = ReturnType<typeof usePaletteUpload>;

function Hero({ swatches, fileName, isDemo, status, error, setStatus, setError, handleFile, resetToDemo }: PaletteUpload) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => fileInputRef.current?.click();

  const handleDownload = async () => {
    try {
      await downloadPaletteAsPng(swatches, fileName);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't create the PNG.");
    }
  };

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-16 pb-20 md:pt-24 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <div className="ps-reveal inline-flex items-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ps-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--ps-ink)]" />
            Named palettes from any photo
          </div>
          <h1 className="ps-reveal font-display mt-6 text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
            Turn a photo into a palette
            <span className="relative inline-block">
              {" "}worth{" "}
              <span className="relative z-10 text-[var(--ps-ink)]">keeping</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-[var(--ps-citron)] md:h-4" />
            </span>
            .
          </h1>
          <p className="ps-reveal mt-7 max-w-md text-lg leading-relaxed text-[var(--ps-muted)]">
            Drop in any image. PaletteSnap reads the colors that matter and
            gives each one a memorable name — right in your browser, nothing
            uploaded anywhere.
          </p>
          <div className="ps-reveal mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ps-citron)] px-6 py-3.5 text-sm font-semibold text-[var(--ps-citron-ink)] transition-transform hover:scale-[1.03]"
            >
              <Wand2 className="h-4 w-4" /> Try it now
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-6 py-3.5 text-sm font-medium text-[var(--ps-ink)] transition-colors hover:border-[var(--ps-ink)]"
            >
              See how it works
            </a>
          </div>
          <p className="ps-reveal mt-5 text-xs text-[var(--ps-muted)]">
            Free · No account · No upload leaves your device
          </p>
        </div>

        {/* Palette card */}
        <div className="md:col-span-5">
          <div className="ps-reveal relative">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)] transition-colors ${
                isDragging ? "border-[var(--ps-ink)]" : "border-[var(--ps-line)]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[var(--ps-line)] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E0655A]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E8B33A]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4FB06B]" />
                </div>
                <span className="font-mono text-[11px] text-[var(--ps-muted)]">{fileName}</span>
              </div>
              <div className="p-5">
                <div className="flex h-44 overflow-hidden rounded-lg">
                  {swatches.map((s, i) => (
                    <div
                      key={`${s.hex}-${i}`}
                      className="flex-1 transition-[flex] hover:flex-[1.4]"
                      style={{ background: s.hex }}
                    />
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {swatches.map((s, i) => (
                    <div key={`${s.hex}-${i}`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="h-4 w-4 rounded-[3px] border border-[var(--ps-line)]" style={{ background: s.hex }} />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <span className="font-mono text-xs uppercase text-[var(--ps-muted)]">{s.hex}</span>
                    </div>
                  ))}
                </div>

                {status === "error" && error && (
                  <p className="mt-4 text-xs text-[#B04A2E]">{error}</p>
                )}

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={status === "loading"}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ps-ink)] transition-colors hover:border-[var(--ps-ink)] disabled:opacity-50"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {status === "loading" ? "Reading photo…" : isDemo ? "Upload a photo" : "Upload another"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={status === "loading"}
                    title="Download palette as PNG"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ps-ink)] transition-colors hover:border-[var(--ps-ink)] disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" /> PNG
                  </button>
                  {!isDemo && (
                    <button
                      type="button"
                      onClick={resetToDemo}
                      title="Reset to demo palette"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-[var(--ps-muted)] transition-colors hover:text-[var(--ps-ink)]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 rotate-12 rounded-xl bg-[var(--ps-citron)]/20 md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramGridPreview({ swatches }: { swatches: Swatch[] }) {
  const insights = useMemo(() => getGridInsights(swatches), [swatches]);
  const tiles = useMemo(() => Array.from({ length: 9 }, (_, i) => swatches[i] ?? null), [swatches]);

  return (
    <section id="instagram" className="border-t border-[var(--ps-line)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="ps-reveal max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--ps-muted)]">Instagram grid</span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Lay out your feed around this palette.
          </h2>
        </div>
        <div className="ps-reveal mt-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--ps-line)] bg-white p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-3 gap-1">
              {tiles.map((s, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[3px]"
                  style={{ background: s ? s.hex : "var(--ps-paper)" }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-[var(--ps-ink)]">
              {insights?.caption ?? "Upload a photo above to see a suggested grid built from its colors."}
            </p>
            <p className="mt-4 text-sm text-[var(--ps-muted)]">
              The colored tiles above are seeded straight from your palette — the rest of
              the grid stays open for the photos you actually post.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: ImageIcon, title: "Upload any photo", body: "Drag in a screenshot, a picture from your camera roll, or a reference you saved. JPG, PNG, or WebP." },
    { n: "02", icon: Wand2, title: "Get a named palette", body: "We extract the dominant colors and give each a name that actually means something — so you can remember and reuse them." },
    { n: "03", icon: Download, title: "Copy and use it", body: "Grab the hex codes straight off the card and drop them into your next design. Free, no account needed." },
  ];
  return (
    <section id="how" className="border-t border-[var(--ps-line)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="ps-reveal max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--ps-muted)]">How it works</span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps. No sign-up until you want the export.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--ps-line)] bg-[var(--ps-line)] md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="ps-grid-item bg-white p-8 transition-colors hover:bg-[var(--ps-paper)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[var(--ps-muted)]">{s.n}</span>
                <s.icon className="h-5 w-5 text-[var(--ps-ink)]" />
              </div>
              <h3 className="font-display mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ps-muted)]">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SHOWCASE_PHOTO_URL =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80";

const SHOWCASE_FALLBACK_PALETTE: Swatch[] = [
  { hex: "#A7C6D2", name: "Cloud Blue" },
  { hex: "#C09375", name: "Camel" },
  { hex: "#D8D6D5", name: "Mint Whisper" },
  { hex: "#D4BCA8", name: "Blush" },
  { hex: "#918B7B", name: "Muted Clay" },
];

function PhotoToPaletteShowcase() {
  const [swatches, setSwatches] = useState<Swatch[]>(SHOWCASE_FALLBACK_PALETTE);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    extractPaletteFromUrl(SHOWCASE_PHOTO_URL, 5)
      .then((result) => {
        if (!cancelled && result.length > 0) setSwatches(result);
      })
      .catch(() => {
        // Keep the fallback palette if the photo can't be read (e.g. blocked by CORS).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ps-reveal mt-12 flex flex-col items-center gap-8 rounded-2xl border border-[var(--ps-line)] bg-white p-6 sm:p-10 md:flex-row">
      <div className="w-full max-w-xs flex-none -rotate-2 rounded-lg border border-[var(--ps-line)] bg-white p-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]">
        {photoFailed ? (
          <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-[var(--ps-paper)] text-xs text-[var(--ps-muted)]">
            Photo unavailable
          </div>
        ) : (
          <img
            src={SHOWCASE_PHOTO_URL}
            alt="Beach chairs and an umbrella under palm leaves"
            className="aspect-square w-full rounded-sm object-cover"
            onError={() => setPhotoFailed(true)}
          />
        )}
      </div>
      <ArrowRight className="hidden h-6 w-6 flex-none rotate-90 text-[var(--ps-muted)] md:block md:rotate-0" />
      <div className="w-full max-w-xs flex-none overflow-hidden rounded-xl border border-[var(--ps-line)]">
        <div className="flex h-20 overflow-hidden">
          {swatches.map((s, i) => (
            <div key={`${s.hex}-${i}`} className="flex-1" style={{ background: s.hex }} />
          ))}
        </div>
        <div className="space-y-2 bg-white p-4">
          {swatches.map((s, i) => (
            <div key={`${s.hex}-${i}`} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 flex-none rounded-[3px] border border-[var(--ps-line)]" style={{ background: s.hex }} />
                <span className="font-medium">{s.name}</span>
              </div>
              <span className="font-mono text-xs uppercase text-[var(--ps-muted)]">{s.hex}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <section id="gallery" className="bg-[var(--ps-paper)]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="ps-reveal flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--ps-muted)]">Gallery</span>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Palettes pulled from real moments.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-[var(--ps-muted)]">
            Every palette below was named from a photograph. Yours could be next.
          </p>
        </div>

        <PhotoToPaletteShowcase />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryPalettes.map((p) => (
            <div
              key={p.source}
              className="ps-grid-item group overflow-hidden rounded-xl border border-[var(--ps-line)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="flex h-32 overflow-hidden">
                {p.swatches.map((s) => (
                  <div
                    key={s.hex}
                    className="flex-1 transition-[flex] duration-300 group-hover:flex-[0.7]"
                    style={{ background: s.hex }}
                  />
                ))}
              </div>
              <div className="p-5">
                <p className="text-sm font-medium">{p.source}</p>
                <div className="mt-3 space-y-1.5">
                  {p.swatches.map((s) => (
                    <div key={s.hex} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--ps-muted)]">{s.name}</span>
                      <span className="font-mono uppercase text-[var(--ps-muted)]">{s.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--ps-line)] bg-[var(--ps-paper)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-[var(--ps-muted)] sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-[5px] bg-[var(--ps-ink)]">
            <span className="block h-2.5 w-2.5 rounded-[2px] bg-[var(--ps-citron)]" />
          </span>
          <span className="font-display font-semibold text-[var(--ps-ink)]">PaletteSnap</span>
        </div>
        <p className="text-xs">Photos in. Palettes out. © {new Date().getFullYear()} PaletteSnap</p>
      </div>
    </footer>
  );
}

function HomePage() {
  useRevealOnMount();
  useScrollReveal();
  const palette = usePaletteUpload();

  return (
    <div className="min-h-screen bg-[var(--ps-paper)]">
      <Nav />
      <main>
        <Hero {...palette} />
        <InstagramGridPreview swatches={palette.swatches} />
        <HowItWorks />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return <HomePage />;
}

export default App;
