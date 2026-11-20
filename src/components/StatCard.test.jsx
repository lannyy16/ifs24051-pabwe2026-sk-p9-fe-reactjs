import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('menampilkan label, nilai, dan ikon', () => {
    render(<StatCard label="Total" value={7} icon={(p) => <svg data-testid="ikon" {...p} />} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByTestId('ikon')).toBeInTheDocument()
  })
})
