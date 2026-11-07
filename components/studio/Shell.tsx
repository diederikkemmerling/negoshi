import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/studio/actions";

export function Shell({ user, on, children }: { user: { name: string; role: string }; on?: string; children: React.ReactNode }) {
  return (
    <>
      <header className="st-top">
        <div className="in">
          <Logo href="/studio" size={28} />
          <span className="st-badge">Studio</span>
          <nav className="st-nav">
            <a href="/studio" className={on === "home" ? "on" : ""}>Articles</a>
            {user.role === "editor" && <a href="/studio/team" className={on === "team" ? "on" : ""}>Team</a>}
            <a href="/studio/profile" className={`me ${on === "profile" ? "on" : ""}`}>{user.name.length > 22 ? user.name.slice(0, 20) + "…" : user.name}</a>
            <a href="/en/analysis" target="_blank" className="site">Site ↗</a>
            <form action={logoutAction}><button>Log out</button></form>
          </nav>
        </div>
      </header>
      <main className="st-wrap">{children}</main>
    </>
  );
}

export function NotReady() {
  return (
    <div className="st-narrow">
      <h1>Studio is almost ready</h1>
      <p className="st-lead">The storage for articles and images is not connected yet. The site owner connects a Vercel Blob store to this project, then this page opens.</p>
    </div>
  );
}
