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
