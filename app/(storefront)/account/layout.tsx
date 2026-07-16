import { RequireAuth } from "@/components/account/require-auth";
import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">My Account</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-fg sm:text-4xl">
            Welcome Back
          </h1>
        </div>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AccountNav />
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
