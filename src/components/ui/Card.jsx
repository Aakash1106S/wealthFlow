export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`wf-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
