'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTargets, useCreateTarget, useScans, useCreateScan } from '@/hooks/useApi'
import { Shield, ArrowLeft, Plus, Target, Play, Calendar, ExternalLink, Globe, Code, Server } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const { data: targets = [], isLoading: targetsLoading } = useTargets(projectId)
  const { data: scans = [], isLoading: scansLoading } = useScans(projectId)
  const createTarget = useCreateTarget()
  const createScan = useCreateScan()
  
  const [isCreateTargetDialogOpen, setIsCreateTargetDialogOpen] = useState(false)
  const [targetFormData, setTargetFormData] = useState({
    name: '',
    url: '',
    type: 'web' as 'web' | 'api' | 'codebase',
  })

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTarget.mutateAsync({
        projectId,
        ...targetFormData,
      })
      setTargetFormData({ name: '', url: '', type: 'web' })
      setIsCreateTargetDialogOpen(false)
    } catch (error) {
      console.error('Failed to create target:', error)
    }
  }

  const handleCreateScan = async (targetId: string) => {
    try {
      await createScan.mutateAsync({
        projectId,
        targetId,
      })
    } catch (error) {
      console.error('Failed to create scan:', error)
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'web': return <Globe className="h-4 w-4" />
      case 'api': return <Server className="h-4 w-4" />
      case 'codebase': return <Code className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  if (targetsLoading || scansLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
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
              <span className="ml-2 text-2xl font-bold text-gray-900">Project Details</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link href="/projects" className="hover:text-blue-600">Projects</Link>
            <span>/</span>
            <span>Project {projectId.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
              <p className="text-gray-600 mt-2">
                Manage targets and view scan history for this project
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Targets Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Targets</CardTitle>
                    <CardDescription>
                      Manage targets for security testing
                    </CardDescription>
                  </div>
                  
                  <Dialog open={isCreateTargetDialogOpen} onOpenChange={setIsCreateTargetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form onSubmit={handleCreateTarget}>
                        <DialogHeader>
                          <DialogTitle>Add New Target</DialogTitle>
                          <DialogDescription>
                            Add a new target to this project for security testing.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="target-name" className="text-sm font-medium">
                              Target Name
                            </label>
                            <Input
                              id="target-name"
                              value={targetFormData.name}
                              onChange={(e) => setTargetFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Main Web Application"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="target-url" className="text-sm font-medium">
                              Target URL
                            </label>
                            <Input
                              id="target-url"
                              value={targetFormData.url}
                              onChange={(e) => setTargetFormData(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://example.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="target-type" className="text-sm font-medium">
                              Target Type
                            </label>
                            <select
                              id="target-type"
                              value={targetFormData.type}
                              onChange={(e) => setTargetFormData(prev => ({ ...prev, type: e.target.value as any }))}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="web">Web Application</option>
                              <option value="api">API</option>
                              <option value="codebase">Codebase</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCreateTargetDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createTarget.isPending || !targetFormData.name.trim() || !targetFormData.url.trim()}
                          >
                            {createTarget.isPending ? 'Adding...' : 'Add Target'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {targets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targets.map((target) => (
                        <TableRow key={target.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTargetIcon(target.type)}
                              <div>
                                <div className="font-medium">{target.name}</div>
                                <div className="text-sm text-gray-600">{target.url}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {target.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={target.status === 'active' ? 'success' : 'secondary'}
                            >
                              {target.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(target.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleCreateScan(target.id)}
                                disabled={createScan.isPending}
                              >
                                <Play className="mr-1 h-3 w-3" />
                                Scan
                              </Button>
                              <Link href={`/scans?target=${target.id}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No targets</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add your first target to start security testing.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsCreateTargetDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Target
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>
                  Latest security scans for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scan ID</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scans.slice(0, 5).map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {scan.id.slice(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm">
                              {scan.targetId.slice(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                scan.status === 'completed' ? 'success' :
                                scan.status === 'running' ? 'default' :
                                scan.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {scan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                scan.severity === 'critical' ? 'destructive' :
                                scan.severity === 'high' ? 'warning' :
                                scan.severity === 'medium' ? 'default' : 'secondary'
                              }
                              className="capitalize"
                            >
                              {scan.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scan.startedAt ? format(new Date(scan.startedAt), 'MMM d, HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            <Link href={`/scans/${scan.id}`}>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No scans</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start your first scan to see results here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Targets</span>
                  <span className="font-medium">{targets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Scans</span>
                  <span className="font-medium">{scans.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Targets</span>
                  <span className="font-medium">
                    {targets.filter(t => t.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Scan</span>
                  <span className="font-medium text-sm">
                    {scans.length > 0 ? 
                      format(new Date(scans[0].createdAt), 'MMM d') : 
                      'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => setIsCreateTargetDialogOpen(true)}
                  disabled={targets.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Run Full Scan
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Scan
                </Button>
                <Link href={`/projects/${projectId}/reports`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}