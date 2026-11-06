import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', hover = true, gradient = false }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 ${
        hover ? 'hover:scale-[1.02]' : ''
      } ${className}`}
      style={{
        background: gradient
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)'
          : '#ffffff',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backdropFilter: gradient ? 'blur(10px)' : 'none',
      }}
    >
      {children}
    </div>
  );
}
