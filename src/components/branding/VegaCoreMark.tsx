export function VegaCoreMark({
  tone = "cream",
  className = "",
}: {
  tone?: "cream" | "forest";
  className?: string;
}) {
  const src = tone === "cream" ? "/brand/vegacore-white.png" : "/brand/vegacore-dark.png";

  return (
    <span className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <img
        src={src}
        alt="Vega Core"
        className="h-8 w-auto max-w-[9.5rem] object-contain object-center sm:h-9"
      />
    </span>
  );
}
