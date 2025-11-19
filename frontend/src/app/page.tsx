"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  PenSquare,
  Trash2,
  Sparkles,
  Shield,
  BarChart3,
} from "lucide-react";

import { apiRequest, DEFAULT_API_BASE_URL } from "@/lib/api";
import {
  DashboardResponse,
  DashboardSummary,
  MutationResponse,
  Transaction,
  TransactionsResponse,
} from "@/types/api";
import { clearSession, getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatedSection } from "@/components/animated-section";
import { Sidebar } from "@/components/sidebar";

type ToastMessage = { type: "success" | "error" | "info"; message: string };
type ToastType = ToastMessage["type"];
type Toast = ToastMessage | null;

const initialTransactionForm = () => ({
  type: "income" as "income" | "expense",
  amount: "",
  category: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
});

export default function HomePage() {
  const apiBaseUrl = DEFAULT_API_BASE_URL;
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsMeta, setTransactionsMeta] = useState({ total: 0, total_page: 1 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [filterType, setFilterType] = useState<"" | "income" | "expense">("");
  const [transactionForm, setTransactionForm] = useState(initialTransactionForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [session, setSession] = useState<{ token: string; email?: string } | null>(null);

  const [toast, setToast] = useState<Toast>(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isMutatingTransaction, setIsMutatingTransaction] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, transactionsMeta.total_page || 1),
    [transactionsMeta.total_page],
  );

  useEffect(() => {
    setSession(getSession());
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!apiBaseUrl) return;
    setIsFetchingSummary(true);
    try {
      const response = await apiRequest<DashboardResponse>(apiBaseUrl, "/dashboard");
      setDashboard(response.data);
    } catch (error) {
      showToast("error", (error as Error).message);
      setDashboard(null);
    } finally {
      setIsFetchingSummary(false);
    }
  }, [apiBaseUrl, showToast]);

  const fetchTransactions = useCallback(async () => {
    if (!apiBaseUrl) return;
    setIsFetchingTransactions(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filterType) params.set("type", filterType);
      const response = await apiRequest<TransactionsResponse>(apiBaseUrl, `/transactions?${params.toString()}`);
      setTransactions(response.data);
      setTransactionsMeta({
        total: response.meta.total,
        total_page: response.meta.total_page,
      });
    } catch (error) {
      showToast("error", (error as Error).message);
      setTransactions([]);
    } finally {
      setIsFetchingTransactions(false);
    }
  }, [apiBaseUrl, filterType, limit, page, showToast]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setEditingId(null);
    setTransactionForm(initialTransactionForm());
    showToast("info", "Sesi admin ditutup.");
  };

  const handleTransactionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token) {
      showToast("error", "Login sebagai admin/bendahara untuk mengelola transaksi.");
      return;
    }
    setIsMutatingTransaction(true);
    try {
      const payload = {
        ...transactionForm,
        amount: Number(transactionForm.amount),
      };

      if (editingId) {
        await apiRequest<MutationResponse>(apiBaseUrl, `/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          requireAuth: true,
          token: session.token,
        });
        showToast("success", "Transaksi diperbarui.");
      } else {
        await apiRequest<MutationResponse>(apiBaseUrl, "/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
          requireAuth: true,
          token: session.token,
        });
        showToast("success", "Transaksi baru tercatat.");
      }

      setTransactionForm(initialTransactionForm());
      setEditingId(null);
      await Promise.all([fetchDashboard(), fetchTransactions()]);
    } catch (error) {
      showToast("error", (error as Error).message);
    } finally {
      setIsMutatingTransaction(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!session?.token) {
      showToast("error", "Butuh token admin untuk menghapus data.");
      return;
    }
    setDeletingId(id);
    try {
      await apiRequest<MutationResponse>(apiBaseUrl, `/transactions/${id}`, {
        method: "DELETE",
        requireAuth: true,
        token: session.token,
      });
      showToast("success", "Transaksi dihapus.");
      await Promise.all([fetchDashboard(), fetchTransactions()]);
    } catch (error) {
      showToast("error", (error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar session={session} />
        <main className="flex-1 transition-all md:ml-[var(--sidebar-width)]">
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 pb-20 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10 animate-float bg-hero-grid opacity-40 blur-3xl" />

            <AnimatedSection delay={0.12}>
              <header className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-2xl shadow-black/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-primary/10 to-secondary/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
                <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
                <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.45fr,0.55fr]">
                  <div className="space-y-6 text-center sm:text-left">
                    <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/70 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground dark:bg-slate-950/60 sm:mx-0">
                      Portal Kas Angkatan
                    </div>
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                        Transparansi <span className="text-primary">Dana</span> &amp; Kendali Bendahara
                      </h1>
                      <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        Pantau saldo kas, pemasukan, dan pengeluaran secara real time. Supabase Auth memastikan hanya admin
                        dan bendahara yang dapat memanipulasi data.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <Button size="lg" asChild className="w-full sm:w-auto">
                        <Link href="#transactions">Lihat Riwayat</Link>
                      </Button>
                      {!session?.token && (
                        <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                          <Link href="/login">Login Admin</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-white/30 bg-white/85 p-6 text-sm shadow-xl shadow-black/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/85">
                    <div className="space-y-5 text-center sm:text-left">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                          Status Admin
                        </p>
                        {session?.token ? (
                          <div className="mt-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Terautentikasi sebagai</p>
                            <p className="text-lg font-semibold">{session.email ?? "Admin Angkatan"}</p>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-4 text-sm text-muted-foreground">
                            Belum ada token aktif. Login untuk mencatat transaksi.
                          </div>
                        )}
                      </div>
                      {session?.token ? (
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                          Logout
                        </Button>
                      ) : (
                        <Button className="w-full" asChild>
                          <Link href="/login">Masuk sebagai Admin</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </header>
            </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <FeatureHighlights />
        </AnimatedSection>

        {toast && (
          <Alert variant={toast.type === "error" ? "destructive" : toast.type === "success" ? "success" : "default"}>
            <AlertDescription className="font-medium">{toast.message}</AlertDescription>
          </Alert>
        )}

        <AnimatedSection delay={0.2}>
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Saldo Terkini"
            icon={Wallet}
            value={dashboard ? formatCurrency(dashboard.total_balance) : "..."}
            loading={isFetchingSummary}
            accent="from-blue-500/20"
          />
          <StatCard
            title="Total Pemasukan"
            icon={TrendingUp}
            value={dashboard ? formatCurrency(dashboard.total_income) : "..."}
            loading={isFetchingSummary}
            accent="from-emerald-500/20"
          />
          <StatCard
            title="Total Pengeluaran"
            icon={TrendingDown}
            value={dashboard ? formatCurrency(dashboard.total_expense) : "..."}
            loading={isFetchingSummary}
            accent="from-rose-500/20"
          />
        </section>
        </AnimatedSection>

        <AnimatedSection delay={0.35}>
        <section className="grid grid-cols-1 gap-6" id="transactions">
          <Card className="rounded-3xl border-border/70">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl">Riwayat Transaksi</CardTitle>
                <CardDescription>
                  Data publik dengan filter tipe transaksi serta pagination.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm"
                  value={filterType}
                  onChange={(event) => {
                    setFilterType(event.target.value as "" | "income" | "expense");
                    setPage(1);
                  }}
                >
                  <option value="">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
                <select
                  className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm"
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 8, 12, 20].map((size) => (
                    <option key={size} value={size}>
                      {size} / halaman
                    </option>
                  ))}
                </select>
                <Button variant="ghost" size="sm" onClick={() => void Promise.all([fetchDashboard(), fetchTransactions()])}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    {session?.token && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingTransactions && (
                    <TableRow>
                      <TableCell colSpan={session?.token ? 6 : 5}>Memuat data...</TableCell>
                    </TableRow>
                  )}
                  {!isFetchingTransactions && transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={session?.token ? 6 : 5}>
                        Belum ada data sesuai filter ini.
                      </TableCell>
                    </TableRow>
                  )}
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "success" : "destructive"}>
                          {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.description ?? "-"}
                      </TableCell>
                      {session?.token && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(transaction.id);
                                setTransactionForm({
                                  type: transaction.type,
                                  amount: String(transaction.amount),
                                  category: transaction.category,
                                  description: transaction.description ?? "",
                                  date: transaction.transaction_date.slice(0, 10),
                                });
                              }}
                            >
                              <PenSquare className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              disabled={deletingId === transaction.id}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              {deletingId === transaction.id ? "..." : "Hapus"}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <span>
                  Halaman {page} dari {totalPages} &bull; {transactionsMeta.total} transaksi total
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        </AnimatedSection>

        <AnimatedSection delay={0.45}>
        <section className="grid grid-cols-1 gap-6">
          <Card className="rounded-3xl border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">Panel Admin</CardTitle>
              <CardDescription>
                Login untuk menambah, mengubah, atau menghapus transaksi. Status token hanya tersimpan di browser Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session?.token ? (
                <Alert variant="default" className="border-dashed border-border">
                  <AlertDescription>
                    Belum ada token aktif. <Link href="/login" className="underline">Masuk sekarang</Link> untuk mengelola data.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="success">
                  <AlertDescription>
                    Terhubung sebagai <span className="font-semibold">{session.email ?? "admin"}</span>.
                  </AlertDescription>
                </Alert>
              )}

              {session?.token && (
                <form className="space-y-4" onSubmit={handleTransactionSubmit}>
                  <div className="space-y-2">
                    <Label>Tipe Transaksi</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["income", "expense"] as const).map((type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setTransactionForm((prev) => ({ ...prev, type }))}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                            transactionForm.type === type
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                          )}
                        >
                          {type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (IDR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={0}
                      value={transactionForm.amount}
                      onChange={(event) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          amount: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={transactionForm.category}
                      onChange={(event) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          category: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={transactionForm.description}
                      onChange={(event) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={transactionForm.date}
                      onChange={(event) =>
                        setTransactionForm((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={isMutatingTransaction}>
                      {isMutatingTransaction
                        ? "Menyimpan..."
                        : editingId
                          ? "Update Transaksi"
                          : "Tambah Transaksi"}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setTransactionForm(initialTransactionForm());
                        }}
                      >
                        Batalkan edit
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Semua transaksi otomatis mencatat user ID melalui Supabase JWT.
            </CardFooter>
          </Card>
        </section>
        </AnimatedSection>

        <footer className="pb-10 text-center text-sm text-muted-foreground">
          Dibuat oleh Naufal Waiz dan Revario 😝 • {new Date().getFullYear()}
        </footer>
      </div>
      </main>
      </div>
    </div>
  );
}

function FeatureHighlights() {
  const features = [
    {
      title: "Realtime Transparency",
      description: "Dashboard publik selalu sinkron dengan backend Golang & Supabase.",
      icon: Sparkles,
      colors: "from-indigo-500/20 via-sky-500/10 to-transparent",
    },
    {
      title: "Keamanan RBAC",
      description: "Supabase Auth dengan role admin/bendahara menjaga kendali akses.",
      icon: Shield,
      colors: "from-emerald-500/20 via-lime-400/10 to-transparent",
    },
    {
      title: "Insight Finansial",
      description: "Statistik pemasukan dan pengeluaran membantu pengambilan keputusan.",
      icon: BarChart3,
      colors: "from-amber-400/25 via-orange-400/10 to-transparent",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <Card
          key={feature.title}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-black/5 backdrop-blur"
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", feature.colors)} />
          <CardContent className="relative flex items-start gap-4 p-6">
            <div className="rounded-2xl bg-background/80 p-3 text-primary shadow-inner shadow-black/5">
              <feature.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

interface StatCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  loading: boolean;
  accent: string;
}

function StatCard({ title, icon: Icon, value, loading, accent }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border/50 bg-card/95 shadow-xl shadow-black/10">
      <div className="relative p-6">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", accent)} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{loading ? "..." : value}</p>
          </div>
          <div className="rounded-2xl bg-background/70 p-3 text-primary shadow-inner shadow-black/5">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
