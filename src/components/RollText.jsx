/**
 * Label that rolls upward on hover/focus, revealing a duplicate underneath.
 * The clone is hidden from assistive tech so the link is announced once.
 */
export default function RollText({ children }) {
  return (
    <span className="roll-text">
      <span className="roll-text__inner">{children}</span>
      <span className="roll-text__clone" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
