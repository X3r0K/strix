'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api, type ApiResponse, type PaginatedResponse } from '@/lib/api'

// Types for our domain
export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  targets: Target[]
  scans: Scan[]
}

export interface Target {
  id: string
  projectId: string
  name: string
  url: string
  type: 'web' | 'api' | 'codebase'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Scan {
  id: string
  projectId: string
  targetId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  findings: Finding[]
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export interface Finding {
  id: string
  scanId: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'strix' | 'nuclei'
  validated: boolean
  createdAt: string
}

export interface Report {
  id: string
  scanId: string
  format: 'pdf' | 'html' | 'json'
  url: string
  createdAt: string
}

// Custom hook for authenticated API calls
function useApi() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const token = await getToken()
    
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      toast.error(errorMessage)
      throw error
    }
  }

  return {
    get: makeRequest,
    post: <T>(endpoint: string, body?: any) => 
      makeRequest<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
    put: <T>(endpoint: string, body?: any) => 
      makeRequest<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: <T>(endpoint: string) => 
      makeRequest<T>(endpoint, { method: 'DELETE' }),
  }
}

// Projects hooks
export function useProjects() {
  const api = useApi()
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/api/projects'),
  })
}

export function useCreateProject() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Project>('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
  })
}

// Targets hooks
export function useTargets(projectId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['targets', projectId],
    queryFn: () => api.get<Target[]>(`/api/projects/${projectId}/targets`),
    enabled: !!projectId,
  })
}

export function useCreateTarget() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { projectId: string; name: string; url: string; type: string }) =>
      api.post<Target>(`/api/projects/${data.projectId}/targets`, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['targets', variables.projectId] })
      toast.success('Target added successfully')
    },
  })
}

// Scans hooks
export function useScans(projectId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['scans', projectId],
    queryFn: () => api.get<Scan[]>(`/api/projects/${projectId}/scans`),
    enabled: !!projectId,
  })
}

export function useScan(scanId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => api.get<Scan>(`/api/scans/${scanId}`),
    enabled: !!scanId,
    refetchInterval: 5000, // Poll every 5 seconds for live updates
  })
}

export function useCreateScan() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { projectId: string; targetId: string }) =>
      api.post<Scan>('/api/scans', data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scans', variables.projectId] })
      toast.success('Scan started successfully')
    },
  })
}

// Findings hooks
export function useFindings(scanId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['findings', scanId],
    queryFn: () => api.get<Finding[]>(`/api/scans/${scanId}/findings`),
    enabled: !!scanId,
  })
}

// Reports hooks
export function useReports(scanId: string) {
  const api = useApi()
  
  return useQuery({
    queryKey: ['reports', scanId],
    queryFn: () => api.get<Report[]>(`/api/scans/${scanId}/reports`),
    enabled: !!scanId,
  })
}

export function useGenerateReport() {
  const api = useApi()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { scanId: string; format: 'pdf' | 'html' | 'json' }) =>
      api.post<Report>(`/api/scans/${data.scanId}/reports`, { format: data.format }),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.scanId] })
      toast.success('Report generated successfully')
    },
  })
}