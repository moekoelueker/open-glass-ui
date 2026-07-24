import type { SVGProps } from "react";

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: "arrow" | "check" | "chevron" | "grid" | "more" | "spark" | "tune";
}) {
  const path = {
    arrow: "M5 12h14m-5-5 5 5-5 5",
    check: "m5 12 4 4L19 6",
    chevron: "m8 10 4 4 4-4",
    grid: "M5 5h5v5H5zm9 0h5v5h-5zM5 14h5v5H5zm9 0h5v5h-5z",
    more: "M6 12h.01M12 12h.01M18 12h.01",
    spark: "m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z",
    tune: "M4 7h10m4 0h2M4 17h2m4 0h10M14 5v4M6 15v4",
  }[name];

  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
