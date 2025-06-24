import React from 'react'

interface ImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fill,
  className,
  width,
  height
}) => {
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${className || ''}`}
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
} 