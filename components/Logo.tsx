import Link from "next/link";

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link className={`brand ${light ? "brand-light" : ""}`} href={href} aria-label="Framelet home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>framelet</span>
    </Link>
  );
}
