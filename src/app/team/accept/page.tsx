"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Lands here from a Supabase invite email. The browser client auto-detects
// the session from the URL (hash-fragment tokens or a token_hash query
// param, depending on project config) — this page just waits for that
// session to appear, then lets the new team member set their password.
function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (tokenHash && type === "invite") {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" }).then(({ error }) => {
        if (error) setError(error.message);
        setReady(true);
      });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) setReady(true);
        });
        return () => sub.subscription.unsubscribe();
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <Card className="shadow-popover">
      <CardHeader>
        <CardTitle>Set your password</CardTitle>
      </CardHeader>
      <CardContent>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Confirming your invite…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving..." : "Save and continue"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <AcceptInviteForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
