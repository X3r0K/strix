'use client'

import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProjects, useScans } from '@/hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Shield, Target, Zap, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects()
  const { data: scans = [], isLoading: scansLoading } = useScans(projects[0]?.id || '')

  // Mock data for charts - in real app this would come from API
  const severityData = [
    { name: 'Critical', count: 2, color: '#ef4444' },
    { name: 'High', count: 8, color: '#f97316' },
    { name: 'Medium', count: 15, color: '#eab308' },
    { name: 'Low', count: 25, color: '#22c55e' },
  ]

  const scanTrendsData = [
    { name: 'Mon', scans: 4 },
    { name: 'Tue', scans: 3 },
    { name: 'Wed', scans: 6 },
    { name: 'Thu', scans: 2 },
    { name: 'Fri', scans: 5 },
    { name: 'Sat', scans: 1 },
    { name: 'Sun', scans: 0 },
  ]

  const activeScans = scans.filter(scan => scan.status === 'running' || scan.status === 'pending')
  const recentScans = scans.slice(0, 5)
  const nextScheduledRun = scans.find(scan => scan.startedAt && new Date(scan.startedAt) > new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Strix Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/projects">
                <Button variant="outline">Projects</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Monitor your security testing activities and recent findings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Active security projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeScans.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently running scans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {severityData.find(s => s.name === 'Critical')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <p className="text-xs text-muted-foreground">
                Scan completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Findings by Severity</CardTitle>
              <CardDescription>
                Distribution of security findings across severity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scan Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Scan Activity</CardTitle>
              <CardDescription>
                Number of scans performed over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scanTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Latest security scans and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Scan #{scan.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {scan.targetId ? `Target ${scan.targetId.slice(0, 8)}` : 'Unknown Target'}
                        </p>
                      </div>
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent scans</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Scheduled Run */}
          <Card>
            <CardHeader>
              <CardTitle>Next Scheduled Scan</CardTitle>
              <CardDescription>
                Upcoming automated security scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextScheduledRun ? (
                <div className="flex items-center space-x-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Automated Scan</p>
                    <p className="text-sm text-gray-600">
                      {nextScheduledRun.startedAt ? new Date(nextScheduledRun.startedAt).toLocaleString() : 'Not scheduled'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Project: {nextScheduledRun.projectId.slice(0, 8)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming scheduled scans</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/projects">
                  <Button>
                    <Target className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                </Link>
                <Button variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Run Manual Scan
                </Button>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}