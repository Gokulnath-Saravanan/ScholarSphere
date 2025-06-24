import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const Link: React.FC<LinkProps> = ({ href, children, className }) => {
  // Handle external links
  if (href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  // Handle internal links
  return (
    <RouterLink to={href} className={className}>
      {children}
    </RouterLink>
  )
} 