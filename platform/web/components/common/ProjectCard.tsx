'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink, Target } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { type Project } from '@/hooks/useApi'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="text-sm">
                {project.description}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary">
            {project.targets?.length || 0} targets
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">Scans: </span>
              <span className="font-medium">{project.scans?.length || 0}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Status: </span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Active
              </Badge>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link href={`/projects/${project.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/targets`} className="flex-1">
              <Button size="sm" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Targets
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}