/**
 * Shown while the first route's code and data load. Same markup as the boot loader in
 * index.html, whose inline styles (`.boot*`) it uses, so the handover is seamless.
 */
export function InitialFallback() {
  return (
    <div className="boot" role="status">
      <div className="boot-mark">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path
            d="M12 10.5 6.5 16l5.5 5.5M20 10.5l5.5 5.5-5.5 5.5"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="boot-bar" />
      <span className="boot-sr">Loading Interview Prep Hub…</span>
    </div>
  );
}
