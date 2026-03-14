import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Loading, LoadingOverlay, Skeleton, SkeletonCard, SkeletonTable } from '@/components/Loading'

describe('Loading', () => {
  it('renders with default props', () => {
    render(<Loading />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders with sm size', () => {
    render(<Loading size="sm" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-4')
  })

  it('renders with md size', () => {
    render(<Loading size="md" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8')
  })

  it('renders with lg size', () => {
    render(<Loading size="lg" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12')
  })

  it('renders with text', () => {
    render(<Loading text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders in fullscreen mode', () => {
    render(<Loading fullscreen />)
    const fullscreenContainer = document.querySelector('.fixed.inset-0')
    expect(fullscreenContainer).toBeInTheDocument()
    expect(fullscreenContainer).toHaveClass('bg-slate-900/90')
  })

  it('applies custom className', () => {
    render(<Loading className="custom-class" />)
    expect(document.querySelector('.flex')).toHaveClass('custom-class')
  })
})

describe('LoadingOverlay', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div data-testid="content">Content</div>
      </LoadingOverlay>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('renders overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div data-testid="content">Content</div>
      </LoadingOverlay>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(document.querySelector('.absolute.inset-0')).toBeInTheDocument()
  })

  it('has relative positioning on container', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    )
    expect(document.querySelector('.relative')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')
    expect(screen.getByTestId('skeleton')).toHaveClass('bg-slate-800')
  })

  it('applies custom className', () => {
    render(<Skeleton className="h-10 w-20" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('h-10')
    expect(screen.getByTestId('skeleton')).toHaveClass('w-20')
  })
})

describe('SkeletonCard', () => {
  it('renders with correct structure', () => {
    render(<SkeletonCard />)
    const container = document.querySelector('.bg-slate-800.rounded-lg')
    expect(container).toBeInTheDocument()
  })

  it('renders three skeleton elements', () => {
    render(<SkeletonCard />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)
  })

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-class" />)
    expect(document.querySelector('.custom-class')).toBeInTheDocument()
  })
})

describe('SkeletonTable', () => {
  it('renders with default row count', () => {
    render(<SkeletonTable />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    // 1 header + 5 default rows
    expect(skeletons.length).toBe(6)
  })

  it('renders with custom row count', () => {
    render(<SkeletonTable rows={3} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    // 1 header + 3 rows
    expect(skeletons.length).toBe(4)
  })

  it('renders with 0 rows', () => {
    render(<SkeletonTable rows={0} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    // Just header
    expect(skeletons.length).toBe(1)
  })

  it('applies custom className', () => {
    render(<SkeletonTable className="custom-class" />)
    expect(document.querySelector('.custom-class')).toBeInTheDocument()
  })
})
