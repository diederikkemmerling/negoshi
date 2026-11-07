export function Mark({ size = 44 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width={size} height={size}>
      <rect x="4" y="28" width="11" height="16" rx="2.5" fill="#1F5FBF" />
      <rect x="18.5" y="17" width="11" height="27" rx="2.5" fill="#D9562B" />
      <rect x="33" y="4" width="11" height="40" rx="2.5" fill="#0F8F7E" />
    </svg>
  );
}

export function Logo({ href, size = 44 }: { href: string; size?: number }) {
  return (
    <a href={href} className="logo" aria-label="Negoshi home">
      <Mark size={size} />
      <span>
        <span className="word">Negoshi</span>
        <span className="dot" />
      </span>
    </a>
  );
}

export function IslandShape({ island, className }: { island: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    aruba: <path d="M20 72 C14 58 30 40 50 32 C66 26 82 22 90 30 C94 38 80 50 64 58 C50 66 36 78 26 78 Z" fill="#fff" />,
    curacao: <path d="M8 62 C10 46 26 40 42 36 C58 32 72 24 86 16 C94 14 98 22 92 30 C80 42 70 46 60 54 C52 62 44 70 28 74 C16 76 8 70 8 62 Z" fill="#fff" />,
    bonaire: (
      <>
        <path d="M42 8 C54 6 64 16 62 30 C60 46 54 60 66 76 C72 86 64 96 52 94 C40 92 32 76 30 60 C28 44 26 28 30 16 C32 10 36 9 42 8 Z" fill="#fff" />
        <circle cx="22" cy="58" r="6" fill="#fff" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      {paths[island]}
    </svg>
  );
}
