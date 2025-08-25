import { cn } from '@/lib/utils'
import React from 'react'

// Typography types and interfaces
export type TypographyVariant =
  // Headers
  | 'h1' | 'h2' | 'h3'
  // Body text
  | 'body-large' | 'body-medium' | 'body-small' | 'body-xsmall'
  // Button text
  | 'button-lg' | 'button-md' | 'button-sm' | 'button-mini'
  // Caption text
  | 'caption-large' | 'caption-medium' | 'caption-small'

export type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

export interface TypographyProps {
  variant: TypographyVariant
  children: React.ReactNode
  className?: string
  as?: TypographyElement
  color?: string
}

// Typography style mappings based on Figma specs
const typographyStyles: Record<TypographyVariant, string> = {
  // Headers - NanumGothic ExtraBold/Bold
  'h1': 'text-[24px] font-[800] leading-[1em]', // Header 1: 24px ExtraBold
  'h2': 'text-[20px] font-[800] leading-[1em]', // Header 2: 20px ExtraBold
  'h3': 'text-[18px] font-[700] leading-[0.99em]', // Header 3: 18px Bold

  // Body text - NanumGothic Bold
  'body-large': 'text-[18px] font-[700] leading-[0.99em]', // Body Large: 18px Bold
  'body-medium': 'text-[16px] font-[700] leading-[0.99em]', // Body Medium: 16px Bold
  'body-small': 'text-[14px] font-[700] leading-[0.99em]', // Body Small: 14px Bold
  'body-xsmall': 'text-[12px] font-[700] leading-[0.99em]', // Body XSmall: 12px Bold

  // Button text - NanumGothic ExtraBold
  'button-lg': 'text-[18px] font-[800] leading-[1em]', // Button Lg: 18px ExtraBold
  'button-md': 'text-[16px] font-[800] leading-[1em]', // Button Md: 16px ExtraBold
  'button-sm': 'text-[16px] font-[800] leading-[1em]', // Button Sm: 16px ExtraBold
  'button-mini': 'text-[14px] font-[800] leading-[1em]', // Button Mini: 14px ExtraBold

  // Caption text - NanumGothic Bold
  'caption-large': 'text-[14px] font-[700] leading-[0.99em]', // Caption Large: 14px Bold
  'caption-medium': 'text-[13px] font-[700] leading-[0.99em]', // Caption Medium: 13px Bold
  'caption-small': 'text-[12px] font-[700] leading-[0.99em]', // Caption Small: 12px Bold
}

// Default element mapping for semantic HTML
const defaultElements: Record<TypographyVariant, TypographyElement> = {
  'h1': 'h1',
  'h2': 'h2',
  'h3': 'h3',
  'body-large': 'p',
  'body-medium': 'p',
  'body-small': 'p',
  'body-xsmall': 'span',
  'button-lg': 'span',
  'button-md': 'span',
  'button-sm': 'span',
  'button-mini': 'span',
  'caption-large': 'span',
  'caption-medium': 'span',
  'caption-small': 'span',
}

// Typography component
export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
  as,
  color = '#333333' // Default text color
}) => {
  const Element = as || defaultElements[variant]

  return (
    <Element
      className={cn(
        'font-nanum-gothic',
        typographyStyles[variant],
        className
      )}
      style={{ color }}
    >
      {children}
    </Element>
  )
}

// Convenience components for easier usage
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
)

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
)

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
)

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-large" {...props} />
)

export const BodyMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-medium" {...props} />
)

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-small" {...props} />
)

export const BodyXSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-xsmall" {...props} />
)

export const ButtonText: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'lg' | 'md' | 'sm' | 'mini' }> = ({
  size = 'md',
  ...props
}) => (
  <Typography variant={`button-${size}` as TypographyVariant} {...props} />
)

export const CaptionLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-large" {...props} />
)

export const CaptionMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-medium" {...props} />
)

export const CaptionSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-small" {...props} />
)

export default Typography
