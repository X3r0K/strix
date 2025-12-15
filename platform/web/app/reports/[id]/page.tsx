'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useReports, useScan } from '@/hooks/useApi'
import { 
  Shield, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  FileText, 
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ReportsPage() {
  const params = useParams()
  const scanId = params.id as string
  
  const { data: scan, isLoading: scanLoading } = useScan(scanId)
  const { data: reports = [], isLoading: reportsLoading } = useReports(scanId)

  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const handleDownload = (reportId: string, format: string) => {
    // In a real app, this would trigger a download
    console.log(`Downloading report ${reportId} as ${format}`)
  }

  const handlePreview = (reportId: string) => {
    // In a real app, this would open a preview modal or new tab
    console.log(`Previewing report ${reportId}`)
    setSelectedReport(reportId)
  }

  if (scanLoading || reportsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Scan not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The scan you're looking for doesn't exist.
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
              <span className="ml-2 text-2xl font-bold text-gray-900">Reports</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/scans/${scanId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Scan
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
          <Link href={`/scans/${scanId}`} className="hover:text-blue-600">Scan</Link>
          <span>/</span>
          <span>Reports</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Report</h1>
          <p className="text-gray-600">
            Scan #{scan.id.slice(0, 8)} • Generated on {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Report Preview Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Report Preview
                </CardTitle>
                <CardDescription>
                  Comprehensive security assessment report for scan #{scan.id.slice(0, 8)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-6">
                    {/* Mock Report Content */}
                    <div className="border rounded-lg p-6 bg-white">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Security Assessment Report</h2>
                        <p className="text-gray-600">Scan ID: {scan.id}</p>
                        <p className="text-gray-600">Generated: {format(new Date(), 'MMMM d, yyyy HH:mm')}</p>
                      </div>

                      <div className="space-y-6">
                        <section>
                          <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
                          <p className="text-gray-700">
                            This security assessment identified {scan.findings?.length || 0} potential vulnerabilities 
                            across the tested application. The scan utilized both automated AI-driven testing (Strix) 
                            and rule-based scanning (Nuclei) to provide comprehensive coverage.
                          </p>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">2</div>
                              <div className="text-sm text-gray-600">Critical Issues</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">8</div>
                              <div className="text-sm text-gray-600">High Priority</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-yellow-600">15</div>
                              <div className="text-sm text-gray-600">Medium Priority</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">25</div>
                              <div className="text-sm text-gray-600">Low Priority</div>
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Address critical vulnerabilities immediately to prevent potential exploitation</li>
                            <li>Implement proper input validation and sanitization</li>
                            <li>Update dependencies to patch known security issues</li>
                            <li>Consider implementing additional security headers</li>
                            <li>Regular security assessments should be conducted</li>
                          </ul>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Select a report to preview</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a report from the list to view its content.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reports List Sidebar */}
          <div className="space-y-6">
            {/* Scan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={
                      scan.status === 'completed' ? 'success' :
                      scan.status === 'running' ? 'default' :
                      scan.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {scan.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Severity:</span>
                  <Badge variant={getSeverityColor(scan.severity)} className="capitalize">
                    {scan.severity}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Findings:</span>
                  <span className="font-medium">{scan.findings?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Started:</span>
                  <span className="text-xs">
                    {scan.startedAt ? format(new Date(scan.startedAt), 'MMM d, HH:mm') : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Available Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Reports</CardTitle>
                <CardDescription>
                  Download or preview generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="uppercase text-xs">
                            {report.format}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(report.createdAt), 'MMM d')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-3">
                          ~2.5 MB
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-xs"
                            onClick={() => handlePreview(report.id)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => handleDownload(report.id, report.format)}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-500">No reports generated yet</p>
                    <p className="text-xs text-gray-400">
                      Generate reports from the scan details page
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/scans/${scanId}`}>
                  <Button variant="outline" className="w-full text-sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Full Scan
                  </Button>
                </Link>
                <Link href={`/projects/${scan.projectId}`}>
                  <Button variant="outline" className="w-full text-sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Back to Project
                  </Button>
                </Link>
                <Button variant="outline" className="w-full text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Follow-up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }
}