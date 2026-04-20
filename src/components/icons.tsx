import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.85.25-1.5 1.5-1.5H17V4.3c-.3-.05-1.3-.15-2.45-.15-2.45 0-4.05 1.45-4.05 4.1V10.5H8v3h2.5V21h3z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.5 3h3l-6.8 7.8L22 21h-6.3l-4.9-6.4L5 21H2l7.3-8.4L2 3h6.4l4.4 5.8L17.5 3zm-1 16h1.7L7.6 4.9H5.8L16.5 19z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22 8.2c-.2-1.5-.9-2.2-2.4-2.4C17.6 5.5 12 5.5 12 5.5s-5.6 0-7.6.3C2.9 6 2.2 6.7 2 8.2 1.7 10.2 1.7 12 1.7 12s0 1.8.3 3.8c.2 1.5.9 2.2 2.4 2.4 2 .3 7.6.3 7.6.3s5.6 0 7.6-.3c1.5-.2 2.2-.9 2.4-2.4.3-2 .3-3.8.3-3.8s0-1.8-.3-3.8zM10 15.5v-7l5.5 3.5-5.5 3.5z" />
    </svg>
  );
}

export function LineIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 3C6.48 3 2 6.58 2 11c0 3.97 3.5 7.3 8.27 7.92.32.07.76.22.87.5.1.25.06.65.03.9l-.14.86c-.04.25-.2 1 .88.55.66-.28 3.55-2.09 4.85-3.58C18.76 16.52 22 14 22 11c0-4.42-4.48-8-10-8zM8.3 13.2H6.4c-.16 0-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29.16 0 .29.13.29.29v3.12h1.6c.16 0 .29.13.29.29 0 .16-.13.29-.29.29zm1.13-.29c0 .16-.13.29-.29.29s-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29s.29.13.29.29v3.41zm4.23 0c0 .13-.08.23-.2.28-.03.01-.07.02-.1.02-.09 0-.18-.04-.23-.12l-1.76-2.4v2.23c0 .16-.13.29-.29.29s-.29-.13-.29-.29V9.5c0-.13.08-.23.2-.28.03-.01.07-.02.1-.02.09 0 .18.04.23.12l1.76 2.4V9.5c0-.16.13-.29.29-.29s.29.13.29.29v3.41zm3.2-1.99c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.6v1.01h1.6c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.9c-.16 0-.29-.13-.29-.29V9.5c0-.16.13-.29.29-.29h1.9c.16 0 .29.13.29.29 0 .16-.13.29-.29.29h-1.6v1.02h1.6z" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ───── Commodity icons (monoline, for price widget) ───── */

function CommodityBase({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function RiceIcon(props: IconProps) {
  // Rice stalk with grains
  return (
    <CommodityBase {...props}>
      <path d="M16 4v24" />
      <path d="M16 8c-3 0-5 2-5 4.5S13 17 16 17" />
      <path d="M16 8c3 0 5 2 5 4.5S19 17 16 17" />
      <path d="M16 14c-3 0-5 2-5 4.5S13 23 16 23" />
      <path d="M16 14c3 0 5 2 5 4.5S19 23 16 23" />
    </CommodityBase>
  );
}

export function ChickenIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <path d="M20 7a4 4 0 1 0-6 3.5" />
      <circle cx="22" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <path d="M24 8l2-1" />
      <path d="M14 10c-3 0-6 3-6 7 0 4 3 8 8 8h4c3 0 5-2 5-5 0-6-4-10-11-10z" />
      <path d="M13 25l-1 3" />
      <path d="M18 25l1 3" />
    </CommodityBase>
  );
}

export function PigIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <ellipse cx="16" cy="17" rx="10" ry="7" />
      <circle cx="13" cy="16" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="16" r="0.8" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="19" rx="2.5" ry="1.8" />
      <circle cx="15" cy="19" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19" r="0.4" fill="currentColor" stroke="none" />
      <path d="M8 12l-1-2M24 12l1-2" />
      <path d="M9 23v2M13 24v2M19 24v2M23 23v2" />
    </CommodityBase>
  );
}

export function EggIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <path d="M16 4c-5 0-9 6-9 13s4 11 9 11 9-4 9-11-4-13-9-13z" />
    </CommodityBase>
  );
}

export function FishIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <path d="M4 16c3-5 8-7 12-7 5 0 9 3 11 7-2 4-6 7-11 7-4 0-9-2-12-7z" />
      <path d="M26 16l4-3v6l-4-3z" fill="currentColor" stroke="none" opacity="0.2" />
      <path d="M26 16l4-3v6z" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <path d="M15 14c1.5 1 1.5 3 0 4M18 13c2 1.5 2 4 0 6" opacity="0.6" />
    </CommodityBase>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <path d="M7 25c0-10 7-17 18-18-0 11-8 18-18 18z" />
      <path d="M7 25c4-4 9-7 15-10" />
    </CommodityBase>
  );
}

export function CitrusIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <circle cx="16" cy="18" r="9" />
      <path d="M16 9V6" />
      <path d="M14 6l2-2 2 2" />
      <path d="M16 18l-6-4M16 18l6-4M16 18l-6 4M16 18l6 4M16 18l-8 0M16 18l8 0" opacity="0.35" />
    </CommodityBase>
  );
}

export function GarlicIcon(props: IconProps) {
  return (
    <CommodityBase {...props}>
      <path d="M16 3c-1 2-1 3-1 4" />
      <path d="M16 7c-6 0-9 5-9 10 0 6 4 10 9 10s9-4 9-10c0-5-3-10-9-10z" />
      <path d="M16 7c-2 2-3 6-3 10s1 8 3 10" opacity="0.35" />
      <path d="M16 7c2 2 3 6 3 10s-1 8-3 10" opacity="0.35" />
    </CommodityBase>
  );
}
