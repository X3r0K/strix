'use client'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { CheckCircle, Clock, Loader2, AlertTriangle, XCircle } from 'lucide-react'

interface ScanStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'pending' | 'running' | 'completed' | 'failed'
  showIcon?: boolean
}

export function ScanStatusBadge({ status, showIcon = true, className, ...props }: ScanStatusBadgeProps) {
  const getVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'running':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getIcon = (status: string) => {
    if (!showIcon) return null
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="mr-1 h-3 w-3" />
      case 'running':
        return <Loader2 className="mr-1 h-3 w-3 animate-spin" />
      case 'failed':
        return <XCircle className="mr-1 h-3 w-3" />
      case 'pending':
        return <Clock className="mr-1 h-3 w-3" />
      default:
        return <AlertTriangle className="mr-1 h-3 w-3" />
    }
  }

  return (
    <Badge variant={getVariant(status)} className={className} {...props}>
      {getIcon(status)}
      <span className="capitalize">{status}</span>
    </Badge>
  )
}