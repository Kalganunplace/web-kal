import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Camera,
  Check,
  CheckCircle,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Gift,
  Home,
  MapPin,
  Plus,
  Receipt,
  Settings,
  Truck,
  User,
  Utensils,
  X,
  type LucideIcon
} from 'lucide-react'
import React from 'react'

// Icon types and interfaces
export type IconName =
  // Navigation icons
  | 'home' | 'receipt' | 'profile' | 'notification' | 'notification-badge'
  // Brand specific icons
  | 'knife' | 'knife-board' | 'knife-smith' | 'circle-won'
  // Action icons
  | 'check' | 'close' | 'plus' | 'alert-circle' | 'check-circle'
  // Direction icons
  | 'chevron-up' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'arrow-left'
  // Settings icon
  | 'setting'
  // Additional icons
  | 'bell' | 'gift' | 'truck' | 'alert-triangle' | 'location' | 'camera'

export type IconSize = 18 | 24 | 36 | 48 | 100

export interface IconProps {
  name: IconName
  size?: IconSize
  className?: string
  color?: string
}

// Icon mapping to Lucide components
const iconMap: Record<IconName, LucideIcon> = {
  // Navigation
  'home': Home,
  'receipt': Receipt,
  'profile': User,
  'notification': Bell,
  'notification-badge': Bell, // We'll add a badge separately

  // Brand specific (using similar icons)
  'knife': Utensils,
  'knife-board': ChefHat,
  'knife-smith': ChefHat,
  'circle-won': CircleDollarSign,

  // Actions
  'check': Check,
  'check-circle': CheckCircle,
  'close': X,
  'plus': Plus,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,

  // Directions
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,

  // Settings and others
  'setting': Settings,
  'bell': Bell,
  'gift': Gift,
  'truck': Truck,
  'location': MapPin,
  'camera': Camera
}

// Icon component
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className,
  color = '#D9D9D9'
}) => {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <IconComponent
      size={size}
      className={cn(className)}
      style={{ color }}
      strokeWidth={2}
    />
  )
}

// Brand specific components
export const KnifeIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="knife" {...props} />
)

export const KnifeBoardIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="knife-board" {...props} />
)

export const KnifeSmithIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="knife-smith" {...props} />
)

export const CircleWonIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="circle-won" {...props} />
)

// Navigation components
export const HomeIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="home" {...props} />
)

export const ReceiptIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="receipt" {...props} />
)

export const ProfileIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="profile" {...props} />
)

export const NotificationIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="notification" {...props} />
)

export const NotificationBadgeIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <div className="relative">
    <Icon name="notification-badge" {...props} />
    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
  </div>
)

// Action components
export const CheckIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="check" {...props} />
)

export const CheckCircleIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="check-circle" {...props} />
)

export const CloseIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="close" {...props} />
)

export const PlusIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="plus" {...props} />
)

export const AlertCircleIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="alert-circle" {...props} />
)

export const AlertTriangleIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="alert-triangle" {...props} />
)

// Direction components
export const ChevronUpIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="chevron-up" {...props} />
)

export const ChevronDownIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="chevron-down" {...props} />
)

export const ChevronLeftIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="chevron-left" {...props} />
)

export const ChevronRightIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="chevron-right" {...props} />
)

export const ArrowLeftIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="arrow-left" {...props} />
)

// Settings component
export const SettingIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="setting" {...props} />
)

// Additional components
export const BellIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="bell" {...props} />
)

export const GiftIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="gift" {...props} />
)

export const TruckIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="truck" {...props} />
)

export const LocationIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="location" {...props} />
)

export const CameraIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="camera" {...props} />
)

export default Icon
