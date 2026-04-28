export function Card({ children, className }) {
  return (
    <div
      className={`rounded-[14px] border border-[#e9ecef] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
