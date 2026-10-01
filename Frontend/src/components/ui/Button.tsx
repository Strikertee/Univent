import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  isLoading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, asChild = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const baseStyles = 'btn-glow inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'
    
    const variants = {
      default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-glow',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-glow',
      outline: 'border-2 border-gray-300 bg-white hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700 hover:shadow-glow dark:border-gray-600 dark:bg-transparent dark:hover:bg-gray-800',
      secondary: 'btn-glow-gold bg-secondary-400 text-black hover:bg-secondary-500 shadow-sm hover:shadow-glow-gold',
      ghost: 'hover:bg-primary-50 hover:text-primary-700 hover:shadow-glow dark:hover:bg-gray-800',
      link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700',
      gradient: 'bg-primary-900 text-white hover:bg-primary-800 shadow-lg hover:shadow-glow-lg',
    }
    
    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 px-4 text-xs',
      lg: 'h-12 px-8 text-base',
      xl: 'h-14 px-10 text-lg',
      icon: 'h-11 w-11',
    }

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }