import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for TextEncoder/TextDecoder (Node.js 18+ has these but Jest needs them)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
  getToken: jest.fn().mockResolvedValue('test-token'),
  authMiddleware: jest.fn(() => ({})),
}))

// Mock React Query
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  refetch: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
}

jest.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, queryFn, enabled = true }: any) => {
    if (!enabled) return { data: undefined, isLoading: false, error: null }
    
    // Mock data based on query key
    let mockData = []
    if (queryKey[0] === 'projects') {
      mockData = [
        {
          id: '1',
          name: 'Test Project',
          description: 'Test Description',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          targets: [],
          scans: [],
        },
      ]
    } else if (queryKey[0] === 'targets' && queryKey[1]) {
      mockData = [
        {
          id: '1',
          projectId: queryKey[1],
          name: 'Test Target',
          url: 'https://example.com',
          type: 'web',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    } else if (queryKey[0] === 'scans' && queryKey[1]) {
      mockData = [
        {
          id: '1',
          projectId: queryKey[1],
          targetId: '1',
          status: 'completed',
          severity: 'medium',
          findings: [],
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]
    } else if (queryKey[0] === 'scan' && queryKey[1]) {
      mockData = {
        id: queryKey[1],
        projectId: '1',
        targetId: '1',
        status: 'completed',
        severity: 'medium',
        findings: [],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    } else if (queryKey[0] === 'findings' && queryKey[1]) {
      mockData = [
        {
          id: '1',
          scanId: queryKey[1],
          title: 'Test Finding',
          description: 'Test Description',
          severity: 'high',
          type: 'strix',
          validated: false,
          createdAt: new Date().toISOString(),
        },
      ]
    } else if (queryKey[0] === 'reports' && queryKey[1]) {
      mockData = []
    }

    return {
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    }
  },
  useMutation: (mutationFn: any) => ({
    mutate: mutationFn,
    mutateAsync: mutationFn,
    isPending: false,
  }),
  useQueryClient: () => mockQueryClient,
}))

// Mock React Query Devtools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM d, yyyy') return 'Jan 1, 2024'
    if (formatStr === 'MMM d, HH:mm') return 'Jan 1, 14:30'
    if (formatStr === 'MMM d, yyyy HH:mm') return 'Jan 1, 2024 14:30'
    return '2024-01-01'
  },
}))