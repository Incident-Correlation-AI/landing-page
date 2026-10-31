import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getDashboardUrl } from './api/auth';

export default function LoginPage() {
  const { user, dashboardUrl, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, show status or link to dashboard
  if (user) {
    return (
      <main className="flex min-h-screen items-center px-5 py-16 text-ink">
        <div className="mx-auto w-full max-w-lg border border-dim bg-bg p-8 font-mono">
          <p className="text-sm tracking-wide text-dim uppercase"># session active</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-accent">$ lad auth status</h1>
          <p className="mt-4 text-base leading-relaxed text-dim sm:text-lg">
            &gt; currently authenticated as: <span className="text-ink">{user.username}</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={dashboardUrl}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-5 text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
            >
              [ open dashboard ]
            </a>
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center border border-dim px-5 text-base text-ink transition-colors duration-150 hover:text-accent"
            >
              $ cd /
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await login(username.trim(), password);
      if (res.ok) {
        window.location.href = getDashboardUrl(res.token);
      } else {
        setError(res.error || 'Authentication failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center px-5 py-16 text-ink">
      <div className="mx-auto w-full max-w-lg border border-dim bg-bg p-8 font-mono">
        <p className="text-sm tracking-wide text-dim uppercase"># security gateway</p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-accent sm:text-3xl">$ lad auth login</h1>
        <p className="mt-2 text-sm text-dim sm:text-base"># enter credentials to issue session cookie</p>

        {error && (
          <div className="mt-6 border border-accent/60 bg-bg p-3 text-sm text-accent">
            &gt; error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm text-dim sm:text-base">
              &gt; username:
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              className="mt-2 w-full border border-dim bg-bg px-3.5 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent"
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-dim sm:text-base">
              &gt; password:
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="mt-2 w-full border border-dim bg-bg px-3.5 py-2.5 text-base text-ink outline-none transition-colors focus:border-accent"
              placeholder="••••••••••••"
            />
          </div>

          <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center border border-accent bg-accent px-6 text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            >
              {submitting ? '[ authenticating... ]' : '[ log in ]'}
            </button>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-dim underline decoration-dim underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              $ cd /
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
