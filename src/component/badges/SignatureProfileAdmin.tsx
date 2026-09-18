"use client";
import { useCallback, useContext, useEffect, useState } from "react";

import { ContextCreator } from "../context/context";

type Recipient = { login: string; granted_by: string; granted_at: string };
export function SignatureProfileAdmin() {
  const setUserData = useContext(ContextCreator)?.setUserData;
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [login, setLogin] = useState("");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(true);
  const update = useCallback(async (method = "GET", username?: string) => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/signature-profiles", {
        method, cache: "no-store", headers: { "Content-Type": "application/json" },
        ...(username ? { body: JSON.stringify({ login: username }) } : {}),
      });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) setAllowed(false);
      if (!response.ok) throw new Error(data.error || "Request failed");
      setRecipients(data.recipients);
      setUserData?.(user => user ? { ...user, signatureProfile: data.recipients.some((recipient: Recipient) => recipient.login === user.login) } : user);
      if (method !== "GET") {
        setMessage(method === "POST" ? `Signature profile granted to ${username}.` : `Signature profile removed from ${username}.`);
        if (method === "POST") setLogin("");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed. Please try again.");
    } finally { setBusy(false); }
  }, [setUserData]);
  useEffect(() => { void update(); }, [update]);
  if (!allowed) return null;
  return <section className="xp-signature-admin" aria-labelledby="signature-heading">
    <h2 id="signature-heading">★ Signature profiles</h2>
    <p>Give a student a signature badge and a special profile card. Their existing badges stay intact.</p>
    <form onSubmit={event => { event.preventDefault(); if (login.trim()) void update("POST", login.trim().toLowerCase()); }}>
      <label>Username<input value={login} onChange={event => setLogin(event.target.value)} required maxLength={64} placeholder="e.g. mmaghri" /></label>
      <button disabled={busy || !login.trim()} type="submit">Grant signature profile</button>
    </form>
    <p role="status">{busy ? "Loading…" : message}</p>
    <div className="xp-signature-list-heading"><strong>Recipients ({recipients.length})</strong><button type="button" disabled={busy} onClick={() => void update()}>Refresh</button></div>
    <label>Find a recipient<input value={filter} onChange={event => setFilter(event.target.value)} placeholder="Search username" /></label>
    <ul>{recipients.filter(user => user.login.includes(filter.trim().toLowerCase())).map(user => <li key={user.login}>
      <div><a href={`https://profile.intra.42.fr/users/${user.login}`} target="_blank" rel="noopener noreferrer">{user.login}</a><small>Granted by {user.granted_by} · {new Date(user.granted_at).toLocaleDateString()}</small></div>
      <button type="button" disabled={busy} aria-label={`Revoke signature profile from ${user.login}`} onClick={() => { if (window.confirm(`Remove the signature badge and design from ${user.login}?`)) void update("DELETE", user.login); }}>Revoke</button>
    </li>)}</ul>
    {!busy && recipients.length === 0 && <p>No signature profiles yet.</p>}
  </section>;
}
