import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with conflict resolution.
 *
 * `clsx` handles conditional class composition.
 * `tailwind-merge` deduplicates conflicting Tailwind utilities so callers
 * can override primitive defaults predictably:
 *
 *   cn('p-4 bg-primary', isDanger && 'bg-destructive', extra)
 *
 * Use in every primitive that accepts a `class` prop.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
