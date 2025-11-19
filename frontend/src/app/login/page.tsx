"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { apiRequest, DEFAULT_API_BASE_URL } from "@/lib/api";
import { LoginResponse } from "@/types/api";
import { saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiRequest<LoginResponse>(DEFAULT_API_BASE_URL, "/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession({
        token: response.access_token,
        email: response.user?.email,
        userId: response.user?.id,
      });
      setMessage({ type: "success", text: "Login berhasil. Mengarahkan ke dashboard..." });
      setTimeout(() => router.push("/"), 1200);
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-hero-grid opacity-40 blur-2xl" />
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="grid gap-10 rounded-[32px] border border-border/60 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-lg dark:bg-card/80 md:grid-cols-[1.2fr,0.8fr]">
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Portal Kas Angkatan
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground">
              Masuk sebagai Admin atau Bendahara
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Gunakan kredensial Supabase Auth Anda untuk mendapatkan JWT token. Token disimpan secara lokal
              dan dipakai untuk create/update/delete transaksi di dashboard utama.
            </p>
          </div>
          <div className="mt-10 space-y-3 rounded-3xl border border-border/70 bg-muted/60 p-5">
            <p className="text-sm font-semibold text-muted-foreground">Tip Keamanan</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Gunakan password kuat dan aktifkan konfirmasi email Supabase.</li>
              <li>Hapus token dengan klik tombol logout pada dashboard setelah selesai.</li>
              <li>Untuk testing, buat user dummy di Supabase Auth lalu set role admin/bendahara di tabel profiles.</li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-primary hover:underline">
              &larr; Kembali ke dashboard publik
            </Link>
          </div>
        </div>

        <Card className="rounded-[28px] border-border/60 bg-card/80 shadow-xl">
          <CardHeader>
            <CardTitle>Login Admin</CardTitle>
            <CardDescription>Masukkan email dan password Supabase Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </Button>
            </form>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "success"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
