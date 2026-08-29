import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdminAuthenticated()) {
    redirect("/admin/leads");
  }

  const params = await searchParams;
  const hasError = params?.error !== undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display text-2xl mb-1">FAO Properties</div>
        <div className="text-sm text-[var(--color-text-on-dark-muted)] mb-8">
          Admin sign in
        </div>

        <form action="/api/admin/login" method="POST" className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)] mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-md border border-[var(--color-navy-line)] bg-[var(--color-navy)] px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-[var(--color-navy-line)] bg-[var(--color-navy)] px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {hasError && (
            <p className="text-sm text-red-400">Incorrect username or password.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-gold)] py-3 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
