'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useScan, useFindings, useReports, useGenerateReport } from '@/hooks/useApi'
import { 
  Shield, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2,
  FileText,
  Bug,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ScanDetailPage() {
  const params = useParams()
  const scanId = params.id as string
  
  const { data: scan, isLoading: scanLoading, refetch: refetchScan } = useScan(scanId)
  const { data: findings = [], isLoading: findingsLoading } = useFindings(scanId)
  const { data: reports = [], isLoading: reportsLoading } = useReports(scanId)
  const generateReport = useGenerateReport()

  const [activeTab, setActiveTab] = useState<'findings' | 'artifacts' | 'reports'>('findings')

  // Auto-refresh for running scans
  useEffect(() => {
    if (scan?.status === 'running' || scan?.status === 'pending') {
      const interval = setInterval(() => {
        refetchScan()
      }, 5000) // Refresh every 5 seconds

      return () => clearInterval(interval)
    }
  }, [scan?.status, refetchScan])

  const handleGenerateReport = async (format: 'pdf' | 'html' | 'json') => {
    try {
      await generateReport.mutateAsync({ scanId, format })
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'running': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const strixFindings = findings.filter(f => f.type === 'strix')
  const nucleiFindings = findings.filter(f => f.type === 'nuclei')

  if (scanLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scan details...</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Scan not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The scan you're looking for doesn't exist or you don't have access to it.
          </p>
          <div className="mt-6">
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Scan Details</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/projects/${scan.projectId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Project
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${scan.projectId}`} className="hover:text-blue-600">Project</Link>
          <span>/</span>
          <span>Scan {scan.id.slice(0, 8)}</span>
        </div>

        {/* Scan Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Security Scan #{scan.id.slice(0, 8)}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Project: {scan.projectId.slice(0, 8)}...</span>
                <span>•</span>
                <span>Target: {scan.targetId.slice(0, 8)}...</span>
                <span>•</span>
                <span>Started: {scan.startedAt ? format(new Date(scan.startedAt), 'MMM d, yyyy HH:mm') : 'Not started'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(scan.status)}
              <div className="text-right">
                <div className="font-medium capitalize">{scan.status}</div>
                <div className="text-sm text-gray-600">
                  {scan.completedAt ? `Completed ${format(new Date(scan.completedAt), 'MMM d, HH:mm')}` : 'In progress'}
                </div>
              </div>
            </div>
          </div>

          {/* Scan Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Bug className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Total Findings</div>
                  <div className="text-xl font-bold">{findings.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Critical</div>
                  <div className="text-xl font-bold text-red-600">
                    {findings.filter(f => f.severity === 'critical').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">High</div>
                  <div className="text-xl font-bold text-orange-600">
                    {findings.filter(f => f.severity === 'high').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Validated</div>
                  <div className="text-xl font-bold text-green-600">
                    {findings.filter(f => f.validated).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'findings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('findings')}
              >
                Findings ({findings.length})
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'artifacts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('artifacts')}
              >
                Artifacts
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                Reports ({reports.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Findings Tab */}
            {activeTab === 'findings' && (
              <div className="space-y-6">
                {/* Strix Findings */}
                {strixFindings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Zap className="h-5 w-5 text-blue-600 mr-2" />
                      Strix AI Findings ({strixFindings.length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {strixFindings.map((finding) => (
                          <TableRow key={finding.id}>
                            <TableCell className="font-medium">{finding.title}</TableCell>
                            <TableCell>
                              <Badge variant={getSeverityColor(finding.severity)} className="capitalize">
                                {finding.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={finding.validated ? 'success' : 'secondary'}>
                                {finding.validated ? 'Validated' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm text-gray-600 truncate" title={finding.description}>
                                {finding.description}
                              </p>
                            </TableCell>
                            <TableCell>
                              {format(new Date(finding.createdAt), 'MMM d, HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Nuclei Findings */}
                {nucleiFindings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Bug className="h-5 w-5 text-green-600 mr-2" />
                      Nuclei Findings ({nucleiFindings.length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nucleiFindings.map((finding) => (
                          <TableRow key={finding.id}>
                            <TableCell className="font-medium">{finding.title}</TableCell>
                            <TableCell>
                              <Badge variant={getSeverityColor(finding.severity)} className="capitalize">
                                {finding.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={finding.validated ? 'success' : 'secondary'}>
                                {finding.validated ? 'Validated' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm text-gray-600 truncate" title={finding.description}>
                                {finding.description}
                              </p>
                            </TableCell>
                            <TableCell>
                              {format(new Date(finding.createdAt), 'MMM d, HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {findings.length === 0 && (
                  <div className="text-center py-12">
                    <Bug className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No findings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {scan.status === 'completed' 
                        ? 'This scan completed without finding any vulnerabilities.' 
                        : 'Scan is still running. Findings will appear here as they are discovered.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Artifacts Tab */}
            {activeTab === 'artifacts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Scan Artifacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Raw Output</CardTitle>
                      <CardDescription>
                        Complete scan output and logs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Download Log File
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Screenshots</CardTitle>
                      <CardDescription>
                        Visual evidence and screenshots
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Screenshots
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Network Traffic</CardTitle>
                      <CardDescription>
                        Captured HTTP requests and responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        View Traffic
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Proof of Concepts</CardTitle>
                      <CardDescription>
                        Validated exploit scripts and PoCs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled>
                        <Bug className="mr-2 h-4 w-4" />
                        View PoCs
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Generated Reports</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateReport('pdf')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateReport('html')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate HTML
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateReport('json')}
                      disabled={generateReport.isPending}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate JSON
                    </Button>
                  </div>
                </div>

                {reports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Format</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {report.format}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">~2.5 MB</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Preview
                              </Button>
                              <Button size="sm">
                                <Download className="mr-1 h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Generate reports to share scan results with stakeholders.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}