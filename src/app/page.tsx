import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(201,162,74,0.12), transparent 70%)",
        }}
      />

      <span className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
        Cal Poly Men&apos;s Basketball
      </span>
      <h1 className="max-w-3xl text-hud-xl font-semibold leading-[1.02] tracking-tight text-white">
        See the floor.
        <br />
        <span className="text-accent-bright">Decide faster.</span>
      </h1>
      <p className="mt-6 max-w-xl text-balance text-white/50">
        A first-person cognitive decision-making simulator. You&apos;re the
        ball handler — recognize the read, make the call, before you ever see
        how it ends.
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/train"
          className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-bright"
        >
          Start Training
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-ink-500 px-8 py-3.5 text-sm font-medium text-white/80 transition hover:border-accent hover:text-accent-bright"
        >
          My Dashboard
        </Link>
        <Link
          href="/coach"
          className="rounded-full border border-ink-500 px-8 py-3.5 text-sm font-medium text-white/80 transition hover:border-accent hover:text-accent-bright"
        >
          Coach View
        </Link>
      </div>
    </main>
  );
}
