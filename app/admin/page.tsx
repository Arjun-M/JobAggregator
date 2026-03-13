"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/admin/staging" : "/admin/login");
  }, [router]);

  return (
    <main className="shell page-stack">
      <section className="panel empty-state">
        <h1>Opening admin dashboard</h1>
        <p className="muted">Redirecting to the available admin route.</p>
      </section>
    </main>
  );
}
