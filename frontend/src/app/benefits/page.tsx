import { Lightbulb, ShieldCheck, CalendarCheck, HeartHandshake, Rocket } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/animated-section";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

const HERO_STATS = [
  { label: "Aktivitas Tahunan", value: "10+", description: "Baksos, wisuda, kegiatan sosial" },
  { label: "Kepatuhan Iuran", value: "95%", description: "Anggota rutin menabung" },
  { label: "Dana Darurat", value: "Rp7jt", description: "Siap pakai untuk urgensi" },
];

const BENEFITS = [
  {
    title: "Solidaritas Finansial",
    body:
      "Kas mengikat komitmen setiap anggota untuk saling menopang biaya kegiatan besar. Mendadak butuh dana? Tim bendahara siap bantu tanpa drama.",
    icon: HeartHandshake,
    accent: "from-indigo-500/20 via-slate-900/80 to-slate-950",
  },
  {
    title: "Perencanaan Terukur",
    body:
      "Anggaran study tour, bakti sosial, atau proyek kreatif dapat dirinci sejak awal sehingga tidak ada panik soal tagihan di akhir.",
    icon: CalendarCheck,
    accent: "from-emerald-500/20 via-slate-900/80 to-slate-950",
  },
  {
    title: "Transparansi Real-Time",
    body:
      "Laporan pemasukan dan pengeluaran selalu sinkron di dashboard publik sehingga seluruh angkatan tahu kondisi kas terkini.",
    icon: ShieldCheck,
    accent: "from-cyan-500/20 via-slate-900/80 to-slate-950",
  },
];

const PRACTICES = [
  {
    title: "Tetapkan nominal iuran realistis",
    detail: "Gunakan skema bertahap supaya semua anggota tetap bisa mengikuti ritme tabungan.",
  },
  {
    title: "Pisahkan rekening kas",
    detail: "Gunakan akun bank khusus agar arus kas tidak tercampur dengan dana pribadi pengurus.",
  },
  {
    title: "Simpan bukti transaksi",
    detail: "Foto nota, unggah invoice, dan arsipkan ke cloud untuk memudahkan audit internal.",
  },
  {
    title: "Evaluasi berkala",
    detail: "Adakan sesi review minimal per kuartal agar tiap divisi tahu status anggaran real-time.",
  },
];

const EXECUTION_STEPS = [
  { title: "Susun Blueprint Kas", description: "Tentukan tujuan 12 bulan dan nominal target yang harus terkumpul.", badge: "01" },
  { title: "Automasi Pencatatan", description: "Manfaatkan dashboard ini untuk tracking iuran dan notifikasi kekurangan.", badge: "02" },
  { title: "Laporkan Secara Publik", description: "Bagikan ringkasan kas bulanan via grup atau newsletter sehingga anggota percaya penuh.", badge: "03" },
  { title: "Rayakan Capaian", description: "Setiap milestone dana tercapai, umumkan dan libatkan semua anggota untuk menjaga semangat.", badge: "04" },
];

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar session={null} />
      <main className="min-h-screen transition-all md:ml-[var(--sidebar-width)]">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 pb-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid opacity-40 blur-3xl" />

          <AnimatedSection delay={0.03}>
            <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-2xl shadow-black/15">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-slate-950/70 to-slate-950" />
              <div className="absolute inset-y-0 right-10 w-1/2 rounded-full bg-primary/25 blur-[120px]" />
              <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr,0.7fr]">
                <div className="space-y-6 text-center sm:text-left">
                  <Badge className="mx-auto bg-white/20 text-xs font-semibold uppercase tracking-[0.35em] text-primary-foreground sm:mx-0">
                    Edukasi Keuangan
                  </Badge>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                      Manfaat Kas Angkatan yang Transparan &amp; Modern
                    </h1>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                      Kas bukan sekadar tabungan bersama. Ia menjadi energi untuk kegiatan kreatif, bantuan darurat, hingga
                      loyalitas alumni. Kelola dengan disiplin dan semua program terasa ringan.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {HERO_STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center text-white/90 backdrop-blur"
                      >
                        <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em]">{stat.label}</p>
                        <p className="mt-1 text-[0.75rem] text-white/70">{stat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-inner shadow-black/20 backdrop-blur">
                  <div className="flex flex-col items-center gap-3 border-b border-white/10 pb-4 text-center sm:flex-row sm:text-left">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                      <Rocket className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Prioritas 2025</p>
                      <p className="text-base font-semibold text-white">Program Kas Terintegrasi</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-center sm:text-left">
                    <li>• Reminder iuran otomatis via dashboard.</li>
                    <li>• Dana darurat terpisah dengan otorisasi berlapis.</li>
                    <li>• Ringkasan mingguan langsung ke email anggota.</li>
                  </ul>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection delay={0.12}>
            <section className="grid gap-6 md:grid-cols-3">
              {BENEFITS.map((item) => (
                <article
                  key={item.title}
                  className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/95 shadow-xl shadow-black/10"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70", item.accent)} />
                  <div className="relative flex h-full flex-col gap-4 p-6">
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-background/80 p-3 text-primary shadow-inner shadow-black/5">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </article>
              ))}
            </section>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Card className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/95 shadow-2xl shadow-black/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Praktik Bijak Mengelola Kas</CardTitle>
                    <CardDescription>Implementasi kecil yang menjaga kas selalu sehat.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative grid gap-4 md:grid-cols-2">
                {PRACTICES.map((tip) => (
                  <div key={tip.title} className="rounded-3xl border border-border/70 bg-background/70 p-5 shadow-inner shadow-black/5">
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{tip.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.28}>
            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <Card className="rounded-[36px] border border-border/60 bg-card/95 p-6 shadow-xl shadow-black/10">
                <div className="mb-6 flex items-center gap-3">
                  <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/5 text-xs uppercase tracking-[0.35em] text-primary">
                    Roadmap
                  </Badge>
                  <p className="text-sm text-muted-foreground">Langkah demi langkah membangun kas yang dipercaya semua anggota.</p>
                </div>
                <ol className="space-y-5">
                  {EXECUTION_STEPS.map((step) => (
                    <li key={step.title} className="relative flex gap-4 rounded-3xl border border-border/60 p-4">
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
                        {step.badge}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="rounded-[36px] border border-border/60 bg-card/95 p-6 shadow-xl shadow-black/10">
                  <div className="flex items-center gap-3">
                  <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary">
                    Reminder
                  </Badge>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Jangan Lupa</p>
                </div>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p>
                    Mintalah feedback anggota minimal setiap kuartal. Mereka akan lebih loyal ketika merasa mendengar update
                    kas secara langsung.
                  </p>
                  <p>
                    Gunakan halaman dashboard utama sebagai portal publik sehingga siapa pun bisa mengecek saldo terkini tanpa
                    harus menunggu laporan admin.
                  </p>
                </div>
              </Card>
            </section>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}




