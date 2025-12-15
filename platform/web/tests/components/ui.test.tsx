import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="destructive">Destructive</Badge>)
    let badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary')

    rerender(<Badge variant="success">Success</Badge>)
    badge = screen.getByText('Success')
    expect(badge).toHaveClass('bg-green-500')
  })
})

describe('Button Component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="outline">Outline</Button>)
    let button = screen.getByRole('button', { name: 'Outline' })
    expect(button).toHaveClass('border')

    rerender(<Button variant="destructive">Destructive</Button>)
    button = screen.getByRole('button', { name: 'Destructive' })
    expect(button).toHaveClass('bg-destructive')
  })
})