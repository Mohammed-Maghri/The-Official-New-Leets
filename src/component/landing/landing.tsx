"use client";
import { useState } from "react";
import { XPIcon } from "../xp/XPIcon";
import { XPWindowControls } from "../xp/XPDesktop";

export function LandingComponent() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  return (
    <main className="xp-login-desktop">
      <section className="xp-login-window" aria-labelledby="login-title">
        <div className="xp-titlebar"><span className="xp-window-caption"><XPIcon name="computer" size={20} />1337LEETS</span><XPWindowControls /></div>
        <div className="xp-login-body">
          <div className="xp-login-brand"><XPIcon name="computer" size={76} /><div><h1 id="login-title">1337LEETS</h1><p>ELITE SCHOOL RANKING</p></div></div>
          <hr />
          <h2>Welcome back</h2>
          <p className="xp-login-description">Your progress, peers, and tools. All in one place.</p>
          <p className="xp-login-note">Many of you said the old UI felt like too much, so I gave it a simpler, Windows XP-inspired look.</p>
          <button className="xp-login-button" disabled={isLoggingIn} onClick={() => { setIsLoggingIn(true); window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URL as string; }}>
            <XPIcon name="users" size={26} />{isLoggingIn ? "Signing in…" : "Login to Platform"}
          </button>
          <div className="xp-login-links">
            <a href="https://github.com/Mohammed-Maghri" target="_blank" rel="noopener noreferrer"><XPIcon name="globe" />Follow the creator</a>
            <span aria-hidden="true" />
            <a href="https://github.com/Mohammed-Maghri/The-Official-New-Leets" target="_blank" rel="noopener noreferrer"><XPIcon name="github" />Star on GitHub ›</a>
          </div>
        </div>
      </section>
    </main>
  );
}
