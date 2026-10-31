import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { pingDashboard } from './api/auth';

export default function DashboardPage() {
  const { user, loading, dashboardUrl, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      window.location.href = dashboardUrl;
    }
  }, [user, loading, dashboardUrl, navigate]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center px-5 py-16 text-ink">
        <div className="mx-auto w-full max-w-lg border border-dim bg-bg p-8 font-mono">
          <p className="text-sm text-dim">&gt; verifying session token...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="flex min-h-screen items-center px-5 py-16 text-ink">
      <div className="mx-auto w-full max-w-2xl border border-dim bg-bg p-8 font-mono">
        <div className="flex items-center justify-between border-b border-dim pb-4">
          <div>
            <p className="text-xs text-dim uppercase"># protected workspace</p>
            <h1 className="mt-1 text-2xl font-medium text-accent sm:text-3xl">$ lad dashboard --status</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 items-center justify-center border border-dim px-4 text-sm text-dim transition-colors hover:border-accent hover:text-accent"
          >
            [ log out ]
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="border border-dim/60 p-4">
            <p className="text-xs text-dim"># session state</p>
            <p className="mt-1 text-base text-ink">
              &gt; user: <span className="text-accent">{user.username}</span>
            </p>
            <p className="mt-1 text-sm text-dim">&gt; redirecting to dashboard at https://logveyra.vercel.app/ ...</p>
          </div>
          <div>
            <a
              href={dashboardUrl}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-5 text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
            >
              [ open logveyra.vercel.app ]
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-accent underline decoration-dim underline-offset-4 hover:decoration-accent"
          >
            $ cd / # return to landing page
          </Link>
          <span className="text-xs text-dim">zsh · session active</span>
        </div>
      </div>
    </main>
  );
}
