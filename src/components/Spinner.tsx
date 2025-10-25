interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const border = size === 'sm' ? 'border-2' : size === 'lg' ? 'border-4' : 'border-[3px]';
  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
      <div className={`${dim} ${border} rounded-full border-neutral-700 border-t-[#646cff] animate-spin`} />
      {label && <span className="ml-2 text-neutral-300 text-sm">{label}</span>}
    </div>
  );
}