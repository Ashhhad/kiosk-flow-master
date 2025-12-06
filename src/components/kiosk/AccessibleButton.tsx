// Accessible Button Components with proper touch targets
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  minSize?: number;
  selected?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, minSize = 60, selected, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'relative flex items-center justify-center touch-manipulation',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'active:scale-95',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={{ minHeight: minSize, minWidth: minSize }}
        aria-pressed={selected}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Addon Chip Component
interface AddonChipProps {
  name: string;
  price: number;
  selected: boolean;
  disabled?: boolean;
  remainingSlots?: number;
  onToggle: () => void;
}

export const AddonChip = ({ name, price, selected, disabled = false, onToggle }: AddonChipProps) => {
  const priceText = price > 0 ? `+$${price.toFixed(2)}` : 'Included';
  const ariaLabel = `${name}, ${priceText}, ${selected ? 'selected' : 'not selected'}${disabled ? ', unavailable' : ''}`;

  return (
    <AccessibleButton
      onClick={onToggle}
      selected={selected}
      disabled={disabled}
      aria-label={ariaLabel}
      minSize={56}
      className={cn(
        'px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl border-2 text-left w-full',
        selected 
          ? 'border-primary bg-primary/10' 
          : disabled 
            ? 'border-border/50 opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50'
      )}
    >
      <span className="flex items-center justify-between gap-2 w-full">
        <span className="flex flex-col min-w-0">
          <span className={cn(
            'text-kiosk-sm lg:text-kiosk-base font-semibold truncate',
            selected ? 'text-primary' : 'text-foreground'
          )}>
            {name}
          </span>
          {price > 0 && (
            <span className="text-kiosk-xs lg:text-kiosk-sm text-primary">
              +${price.toFixed(2)}
            </span>
          )}
        </span>
        
        <span className={cn(
          'w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )} aria-hidden="true">
          {selected && (
            <svg className="w-3 h-3 lg:w-4 lg:h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </span>
    </AccessibleButton>
  );
};

// Quantity Stepper
interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
}

export const QuantityStepper = ({ value, min = 1, max = 99, onChange, label = 'Quantity' }: QuantityStepperProps) => {
  return (
    <div className="flex items-center gap-3 lg:gap-4" role="group" aria-label={label}>
      <AccessibleButton
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        minSize={48}
        className={cn(
          'w-12 h-12 lg:w-14 lg:h-14 rounded-full text-xl lg:text-2xl font-bold',
          value <= min 
            ? 'bg-secondary/50 text-muted-foreground'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        )}
      >
        −
      </AccessibleButton>
      
      <span 
        className="text-kiosk-2xl lg:text-kiosk-3xl font-bold text-foreground w-12 lg:w-16 text-center tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      
      <AccessibleButton
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        minSize={48}
        className={cn(
          'w-12 h-12 lg:w-14 lg:h-14 rounded-full text-xl lg:text-2xl font-bold',
          value >= max
            ? 'bg-primary/50 text-primary-foreground'
            : 'bg-primary text-primary-foreground hover:brightness-110'
        )}
      >
        +
      </AccessibleButton>
    </div>
  );
};