import Icon21 from "@/public/svg/21.svg"

interface MapPinIconProps {
  className?: string
  size?: number
}

export default function MapPinIcon({
  className = "",
  size = 64
}: MapPinIconProps) {
  return (
    <Icon21
      width={size}
      height={size}
      className={className}
    />
  )
}
