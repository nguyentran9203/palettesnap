import { useEffect, useState } from "react";
import { ArrowRight, Check, Image as ImageIcon, Sparkles, Wand2, Download, Mail } from "lucide-react";

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
  }
}

type Swatch = { hex: string; name: string };

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
          <a href="#pricing" className="transition-colors hover:text-[var(--ps-ink)]">Pricing</a>
        </nav>
        <a
          href="#pricing"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ps-ink)] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Get a palette <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-16 pb-20 md:pt-24 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <div className="ps-reveal inline-flex items-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ps-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--ps-ink)]" />
            AI-named palettes from any photo
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
            Drop in any image. PaletteSnap reads the colors that matter, gives
            each one a memorable name, and hands you a clean export to use in
            your next design.
          </p>
          <div className="ps-reveal mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ps-citron)] px-6 py-3.5 text-sm font-semibold text-[var(--ps-citron-ink)] transition-transform hover:scale-[1.03]"
            >
              <Wand2 className="h-4 w-4" /> Try it for free
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ps-line)] bg-white px-6 py-3.5 text-sm font-medium text-[var(--ps-ink)] transition-colors hover:border-[var(--ps-ink)]"
            >
              See how it works
            </a>
          </div>
          <p className="ps-reveal mt-5 text-xs text-[var(--ps-muted)]">
            Free preview · One-time $3 export · No subscription
          </p>
        </div>

        {/* Demo palette card */}
        <div className="md:col-span-5">
          <div className="ps-reveal relative">
            <div className="overflow-hidden rounded-2xl border border-[var(--ps-line)] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between border-b border-[var(--ps-line)] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E0655A]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E8B33A]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4FB06B]" />
                </div>
                <span className="font-mono text-[11px] text-[var(--ps-muted)]">sunset_rooftop.jpg</span>
              </div>
              <div className="p-5">
                <div className="flex h-44 overflow-hidden rounded-lg">
                  {demoPalette.map((s) => (
                    <div key={s.hex} className="flex-1 transition-[flex] hover:flex-[1.4]" style={{ background: s.hex }} />
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {demoPalette.map((s) => (
                    <div key={s.hex} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="h-4 w-4 rounded-[3px] border border-[var(--ps-line)]" style={{ background: s.hex }} />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <span className="font-mono text-xs uppercase text-[var(--ps-muted)]">{s.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 rotate-12 rounded-xl bg-[var(--ps-citron)]/20 md:block" />
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
    { n: "03", icon: Download, title: "Export for $3", body: "Grab a one-time export as CSS variables, a Figma-ready swatch set, or a PNG sheet. No account, no recurring fee." },
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

function Pricing({ onSubmitted }: { onSubmitted: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    onSubmitted(email);
  };

  return (
    <section id="pricing" className="border-t border-[var(--ps-line)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="ps-reveal grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Pricing card */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-[var(--ps-ink)] bg-[var(--ps-ink)] p-8 text-white sm:p-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-white/50">PaletteSnap Export</span>
                <span className="rounded-full bg-[var(--ps-citron)] px-3 py-1 text-xs font-semibold text-[var(--ps-citron-ink)]">
                  One-time
                </span>
              </div>
              <div className="mt-8 flex items-end gap-1">
                <span className="font-display text-6xl font-semibold tracking-tight">$3</span>
                <span className="mb-2 text-sm text-white/50">/ palette, paid once</span>
              </div>
              <p className="mt-4 text-sm text-white/60">
                Preview every palette free. Pay once to export the colors you want to keep.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "CSS variables, Figma swatches, and PNG export",
                  "Copy-paste hex, HSL, and Tailwind tokens",
                  "No account, no subscription, no auto-renewal",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-[var(--ps-citron)]">
                      <Check className="h-2.5 w-2.5 text-[var(--ps-citron-ink)]" />
                    </span>
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#top"
                className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ps-citron)] px-6 py-4 text-sm font-semibold text-[var(--ps-citron-ink)] transition-transform hover:scale-[1.02]"
              >
                <ImageIcon className="h-4 w-4" /> Start a free palette
              </a>
            </div>
            <div className="pointer-events-none absolute -left-5 -bottom-5 hidden h-28 w-28 rounded-2xl bg-[var(--ps-citron)]/30 md:block" />
          </div>

          {/* Email capture */}
          <div className="lg:pl-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--ps-muted)]">Stay in the loop</span>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Get the first palette free.
            </h2>
            <p className="mt-4 max-w-md text-[var(--ps-muted)]">
              Drop your email and we'll send you a free export credit plus new
              features as they ship. One message, then quiet.
            </p>

            {submitted ? (
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-[var(--ps-line)] bg-[var(--ps-paper)] px-5 py-4">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[var(--ps-citron)]">
                  <Check className="h-4 w-4 text-[var(--ps-citron-ink)]" />
                </span>
                <div>
                  <p className="text-sm font-medium">You're on the list.</p>
                  <p className="text-xs text-[var(--ps-muted)]">Your free export credit is on its way to {email}.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ps-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-full border border-[var(--ps-line)] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--ps-ink)]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ps-ink)] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                >
                  Claim free export <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            <p className="mt-4 text-xs text-[var(--ps-muted)]">
              We'll only email about PaletteSnap. Unsubscribe anytime.
            </p>
          </div>
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
  const [, setWaitlistEmail] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--ps-paper)]">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Gallery />
        <Pricing onSubmitted={setWaitlistEmail} />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return <HomePage />;
}

export default App;
