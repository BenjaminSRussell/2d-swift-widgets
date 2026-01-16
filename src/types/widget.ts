export type WidgetSize = 'small' | 'medium' | 'large';

// Dimensions in pixels (approximate point -> pixel conversion for web)
// Based on WidgetKit sizes
export const WIDGET_DIMENSIONS = {
    small: { width: 155, height: 155 },
    medium: { width: 329, height: 155 },
    large: { width: 329, height: 345 },
} as const;
