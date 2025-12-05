// Accessible Button Wrapper - Ensures all touch targets meet accessibility requirements
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  minSize?: number; // Minimum touch target size in pixels
  selected?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, minSize = 72, selected, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative flex items-center justify-center',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2',
          'active:scale-95',
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

// Addon Chip Component with proper accessibility
interface AddonChipProps {
  name: string;
  price: number;
  selected: boolean;
  disabled?: boolean;
  remainingSlots?: number;
  onToggle: () => void;
}

export const AddonChip = ({
  name,
  price,
  selected,
  disabled = false,
  remainingSlots,
  onToggle,
}: AddonChipProps) => {
  const ariaLabel = `${name}, ${price > 0 ? `add-on, ${price} cents` : 'included'}, ${selected ? 'selected' : 'not selected'}${disabled && !selected ? ', maximum add-ons reached' : ''}`;

  return (
    <AccessibleButton
      onClick={onToggle}
      selected={selected}
      disabled={disabled && !selected}
      aria-label={ariaLabel}
      className={cn(
        'px-4 py-3 rounded-xl border-2 text-left',
        selected 
          ? 'border-primary bg-primary/10' 
          : disabled 
            ? 'border-border opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50'
      )}
    >
      <span className="flex items-center justify-between gap-3 w-full">
        <span className="flex flex-col">
          <span className={cn(
            'text-kiosk-base font-semibold',
            selected ? 'text-primary' : 'text-foreground'
          )}>
            {name}
          </span>
          {price > 0 && (
            <span className="text-kiosk-sm text-primary">
              +${price.toFixed(2)}
            </span>
          )}
        </span>
        
        {/* Selection indicator */}
        <span className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}>
          {selected && (
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </span>
    </AccessibleButton>
  );
};

// Quantity Stepper with accessibility
interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
}

export const QuantityStepper = ({
  value,
  min = 1,
  max = 99,
  onChange,
  label = 'Quantity',
}: QuantityStepperProps) => {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div 
      className="flex items-center gap-4"
      role="group"
      aria-label={label}
    >
      <AccessibleButton
        onClick={decrement}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={cn(
          'w-14 h-14 rounded-full text-kiosk-2xl font-bold',
          value <= min 
            ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        )}
      >
        −
      </AccessibleButton>
      
      <span 
        className="text-kiosk-3xl font-bold text-foreground w-16 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      
      <AccessibleButton
        onClick={increment}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={cn(
          'w-14 h-14 rounded-full text-kiosk-2xl font-bold',
          value >= max
            ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        +
      </AccessibleButton>
    </div>
  );
};
