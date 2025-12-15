'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { type Finding } from '@/hooks/useApi'

interface FindingsTableProps {
  findings: Finding[]
  showValidationActions?: boolean
  onValidate?: (findingId: string) => void
  onInvalidate?: (findingId: string) => void
}

export function FindingsTable({ 
  findings, 
  showValidationActions = false,
  onValidate,
  onInvalidate 
}: FindingsTableProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strix': 
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Strix AI
          </div>
        )
      case 'nuclei':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Nuclei
          </div>
        )
      default:
        return type
    }
  }

  const strixFindings = findings.filter(f => f.type === 'strix')
  const nucleiFindings = findings.filter(f => f.type === 'nuclei')

  return (
    <div className="space-y-6">
      {/* Strix Findings */}
      {strixFindings.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold">Strix AI Findings ({strixFindings.length})</h3>
            <Badge variant="outline" className="ml-2">
              AI-Powered
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                {showValidationActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {strixFindings.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(finding.type)}
                      <span>{finding.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(finding.severity)} className="capitalize">
                      {finding.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {finding.validated ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="success">Validated</Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <Badge variant="secondary">Pending</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-3" title={finding.description}>
                      {finding.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {format(new Date(finding.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </TableCell>
                  {showValidationActions && (
                    <TableCell>
                      <div className="flex space-x-1">
                        {finding.validated ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onInvalidate?.(finding.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Invalidate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onValidate?.(finding.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validate
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Nuclei Findings */}
      {nucleiFindings.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold">Nuclei Findings ({nucleiFindings.length})</h3>
            <Badge variant="outline" className="ml-2">
              Rule-Based
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                {showValidationActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nucleiFindings.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(finding.type)}
                      <span>{finding.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(finding.severity)} className="capitalize">
                      {finding.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {finding.validated ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="success">Validated</Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <Badge variant="secondary">Pending</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-3" title={finding.description}>
                      {finding.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {format(new Date(finding.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </TableCell>
                  {showValidationActions && (
                    <TableCell>
                      <div className="flex space-x-1">
                        {finding.validated ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onInvalidate?.(finding.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Invalidate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onValidate?.(finding.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validate
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {findings.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No findings</h3>
          <p className="mt-1 text-sm text-gray-500">
            This scan completed without finding any vulnerabilities.
          </p>
        </div>
      )}
    </div>
  )
}