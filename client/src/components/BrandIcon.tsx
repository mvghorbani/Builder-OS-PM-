type Variant = "neutral" | "brand" | "inverse";
type Size = number;

export default function BrandIcon({
  variant = "brand",
  size = 24,
  className = "",
}: { variant?: Variant; size?: Size; className?: string }) {
  const fill =
    variant === "brand" ? "fill-blue-600"
    : variant === "inverse" ? "fill-white"
    : "fill-gray-400";

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${fill} ${className}`}
      aria-hidden
    >
      <path d="M7 6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2Zm2 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1H9Z"/>
      <path d="M3 11h18v2H3z" />
      <circle cx="10" cy="12" r="0.8" />
      <circle cx="14" cy="12" r="0.8" />
    </svg>
  );
}
