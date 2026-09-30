import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  children: ReactNode
}

const styles: Record<string, string> = {
  primary: 'bg-primary text-white shadow-chunky-primary',
  secondary: 'bg-secondary text-ink shadow-chunky',
  danger: 'bg-danger text-white shadow-chunky-danger',
  success: 'bg-success text-white shadow-chunky',
  ghost: 'bg-white text-ink border-2 border-ink/15 shadow-chunky',
}

export default function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  return (
    <button
      className={
        'min-h-[48px] rounded-chunky px-5 py-3 font-display font-semibold text-base transition-all duration-100 active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ' +
        (styles[variant] ?? styles.primary) +
        ' ' +
        className
      }
      {...rest}
    >
      {children}
    </button>
  )
}
