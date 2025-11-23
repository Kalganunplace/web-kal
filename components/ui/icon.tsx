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

export const ReceiptIcon: React.FC<Omit<IconProps, 'name'>> = ({ size = 24, color = '#D9D9D9', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <path
      d="M32.5 32.5H67.5M32.5 52.5H67.5M24 12.5H76C79.5898 12.5 82.5 15.8579 82.5 20V87.5L71.6667 80L60.8333 87.5L50 80L39.1667 87.5L28.3333 80L17.5 87.5V20C17.5 15.8579 20.4101 12.5 24 12.5Z"
      stroke={color}
      strokeWidth="8.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const ProfileIcon: React.FC<Omit<IconProps, 'name'>> = ({ size = 24, color = '#D9D9D9', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <path
      d="M9.99805 85.466C9.99805 69.7345 23.1409 56.9817 49.998 56.9817C76.8552 56.9817 89.998 69.7345 89.998 85.466C89.998 87.9687 88.1721 89.9975 85.9196 89.9975H14.0765C11.824 89.9975 9.99805 87.9687 9.99805 85.466Z"
      stroke={color}
      strokeWidth="8.33333"
    />
    <path
      d="M64.998 24.9976C64.998 33.2818 58.2823 39.9976 49.998 39.9976C41.7138 39.9976 34.998 33.2818 34.998 24.9976C34.998 16.7133 41.7138 9.99756 49.998 9.99756C58.2823 9.99756 64.998 16.7133 64.998 24.9976Z"
      stroke={color}
      strokeWidth="8.33333"
    />
  </svg>
)

export const NotificationIcon: React.FC<Omit<IconProps, 'name'>> = ({ size = 24, color = '#D9D9D9', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <path
      d="M12.9939 70.279L9.59453 67.8696H9.59453L12.9939 70.279ZM18.4454 53.7128L14.279 53.6652L14.2787 53.689V53.7128H18.4454ZM18.5598 43.6968L22.7262 43.7444L22.7264 43.7206V43.6968H18.5598ZM87.0333 70.3594L90.4793 68.0172L90.4793 68.0172L87.0333 70.3594ZM81.7869 53.7128L77.6206 53.6628L77.6203 53.6878V53.7128H81.7869ZM81.9014 44.1931L86.0677 44.2432L86.068 44.2182V44.1931H81.9014ZM37.499 85.8347C35.1978 85.8347 33.3324 87.7002 33.3324 90.0014C33.3324 92.3026 35.1978 94.168 37.499 94.168V85.8347ZM62.499 94.168C64.8002 94.168 66.6657 92.3026 66.6657 90.0014C66.6657 87.7002 64.8002 85.8347 62.499 85.8347V94.168ZM12.9939 70.279L16.3933 72.6884C19.5187 68.2789 22.612 61.7128 22.612 53.7128H18.4454H14.2787C14.2787 59.5375 12.0171 64.4517 9.59453 67.8696L12.9939 70.279ZM18.4454 53.7128L22.6118 53.7604L22.7262 43.7444L18.5598 43.6968L14.3934 43.6492L14.279 53.6652L18.4454 53.7128ZM87.0333 70.3594L90.4793 68.0172C88.1573 64.601 85.9536 59.6322 85.9536 53.7128H81.7869H77.6203C77.6203 61.7131 80.5868 68.2872 83.5873 72.7016L87.0333 70.3594ZM81.7869 53.7128L85.9533 53.7629L86.0677 44.2432L81.9014 44.1931L77.735 44.1431L77.6206 53.6628L81.7869 53.7128ZM81.9014 44.1931H86.068C86.068 23.2853 70.1866 5.83529 49.999 5.83529V10.002V14.1686C65.0498 14.1686 77.7347 27.3344 77.7347 44.1931H81.9014ZM85.124 75.0014V79.168C88.4457 79.168 90.3811 76.6978 91.114 74.8525C91.8634 72.9655 92.0189 70.2824 90.4793 68.0172L87.0333 70.3594L83.5872 72.7016C83.3798 72.3964 83.3396 72.1341 83.3335 72.0194C83.3276 71.9085 83.3451 71.837 83.3692 71.7764C83.3901 71.7236 83.4728 71.5376 83.725 71.3254C84.0082 71.0872 84.4986 70.8347 85.124 70.8347V75.0014ZM18.5598 43.6968H22.7264C22.7264 27.1122 35.204 14.1686 49.999 14.1686V10.002V5.83529C30.0672 5.83529 14.3931 23.0631 14.3931 43.6968H18.5598ZM14.8786 75.0014V70.8347C15.5178 70.8347 16.014 71.0972 16.2941 71.3373C16.5423 71.5501 16.6184 71.7319 16.635 71.7749C16.6548 71.8263 16.671 71.8902 16.6641 71.9974C16.6569 72.1081 16.614 72.377 16.3933 72.6884L12.9939 70.279L9.59453 67.8696C7.98402 70.1418 8.12664 72.8701 8.85864 74.7704C9.57237 76.6233 11.5028 79.168 14.8786 79.168V75.0014ZM85.124 75.0014V70.8347H14.8786V75.0014V79.168H85.124V75.0014ZM37.499 90.0014V94.168H62.499V90.0014V85.8347H37.499V90.0014Z"
      fill={color}
    />
  </svg>
)

export const NotificationBadgeIcon: React.FC<Omit<IconProps, 'name'>> = ({ size = 24, color = '#D9D9D9', className }) => (
  <div className="relative">
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M12.9939 70.279L9.59453 67.8696H9.59453L12.9939 70.279ZM18.4454 53.7128L14.279 53.6652L14.2787 53.689V53.7128H18.4454ZM18.5598 43.6968L22.7262 43.7444L22.7264 43.7206V43.6968H18.5598ZM87.0333 70.3594L90.4793 68.0172L90.4793 68.0172L87.0333 70.3594ZM81.7869 53.7128L77.6206 53.6628L77.6203 53.6878V53.7128H81.7869ZM81.9014 44.1931L86.0677 44.2432L86.068 44.2182V44.1931H81.9014ZM37.499 85.8347C35.1978 85.8347 33.3324 87.7002 33.3324 90.0014C33.3324 92.3026 35.1978 94.168 37.499 94.168V85.8347ZM62.499 94.168C64.8002 94.168 66.6657 92.3026 66.6657 90.0014C66.6657 87.7002 64.8002 85.8347 62.499 85.8347V94.168ZM12.9939 70.279L16.3933 72.6884C19.5187 68.2789 22.612 61.7128 22.612 53.7128H18.4454H14.2787C14.2787 59.5375 12.0171 64.4517 9.59453 67.8696L12.9939 70.279ZM18.4454 53.7128L22.6118 53.7604L22.7262 43.7444L18.5598 43.6968L14.3934 43.6492L14.279 53.6652L18.4454 53.7128ZM87.0333 70.3594L90.4793 68.0172C88.1573 64.601 85.9536 59.6322 85.9536 53.7128H81.7869H77.6203C77.6203 61.7131 80.5868 68.2872 83.5873 72.7016L87.0333 70.3594ZM81.7869 53.7128L85.9533 53.7629L86.0677 44.2432L81.9014 44.1931L77.735 44.1431L77.6206 53.6628L81.7869 53.7128ZM81.9014 44.1931H86.068C86.068 23.2853 70.1866 5.83529 49.999 5.83529V10.002V14.1686C65.0498 14.1686 77.7347 27.3344 77.7347 44.1931H81.9014ZM85.124 75.0014V79.168C88.4457 79.168 90.3811 76.6978 91.114 74.8525C91.8634 72.9655 92.0189 70.2824 90.4793 68.0172L87.0333 70.3594L83.5872 72.7016C83.3798 72.3964 83.3396 72.1341 83.3335 72.0194C83.3276 71.9085 83.3451 71.837 83.3692 71.7764C83.3901 71.7236 83.4728 71.5376 83.725 71.3254C84.0082 71.0872 84.4986 70.8347 85.124 70.8347V75.0014ZM18.5598 43.6968H22.7264C22.7264 27.1122 35.204 14.1686 49.999 14.1686V10.002V5.83529C30.0672 5.83529 14.3931 23.0631 14.3931 43.6968H18.5598ZM14.8786 75.0014V70.8347C15.5178 70.8347 16.014 71.0972 16.2941 71.3373C16.5423 71.5501 16.6184 71.7319 16.635 71.7749C16.6548 71.8263 16.671 71.8902 16.6641 71.9974C16.6569 72.1081 16.614 72.377 16.3933 72.6884L12.9939 70.279L9.59453 67.8696C7.98402 70.1418 8.12664 72.8701 8.85864 74.7704C9.57237 76.6233 11.5028 79.168 14.8786 79.168V75.0014ZM85.124 75.0014V70.8347H14.8786V75.0014V79.168H85.124V75.0014ZM37.499 90.0014V94.168H62.499V90.0014V85.8347H37.499V90.0014Z"
        fill={color}
      />
    </svg>
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
