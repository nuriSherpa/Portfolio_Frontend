// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadows = {
    none: '',
    sm: 'shadow-admin',
    md: 'shadow-admin-lg',
    lg: 'shadow-xl',
  };

  return (
    <div
      className={`
      bg-white rounded-xl border border-admin-border
      ${paddings[padding]}
      ${shadows[shadow]}
      ${className}
    `}
    >
      {children}
    </div>
  );
}
