export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login">
      <form className="card" method="post" action="/api/login">
        <h1 style={{ margin: "0 0 4px", fontSize: 20 }}>Sign in</h1>
        <p style={{ margin: 0, color: "var(--text-3)", fontSize: 13 }}>Your ad results dashboard</p>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <div className="err">That email and password don’t match.</div>}
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
