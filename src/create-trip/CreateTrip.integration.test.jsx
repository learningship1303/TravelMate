import { createElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CreateTrip from './index'

const toastMock = vi.fn()
const generateTripMock = vi.fn()

vi.mock('sonner', () => ({ toast: (...args) => toastMock(...args) }))

vi.mock('@/service/AIModal', () => ({
  generateTrip: (...args) => generateTripMock(...args),
  getFriendlyAiErrorMessage: (error) => error?.message || 'Something went wrong',
}))

vi.mock('@/service/tripStorage', () => ({
  saveTrip: vi.fn(),
}))

vi.mock('@/service/firebaseAuth', () => ({
  useAuthUser: () => ({ user: { uid: 'test-uid', email: 'test@example.com' } }),
  bridgeGoogleAccessToken: vi.fn(),
}))

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: () => vi.fn(),
}))

vi.mock('@/components/custom/DestinationAutocomplete', () => ({
  DestinationAutocomplete: ({ value, onChangeText, placeholder }) => (
    <input aria-label="Destination" placeholder={placeholder} value={value} onChange={(e) => onChangeText(e.target.value)} />
  ),
}))

vi.mock('framer-motion', () => {
  const passthrough = (tag) => ({ children, ...props }) => {
    const {
      whileHover: _whileHover,
      whileTap: _whileTap,
      whileInView: _whileInView,
      viewport: _viewport,
      initial: _initial,
      animate: _animate,
      variants: _variants,
      transition: _transition,
      ...rest
    } = props
    return createElement(tag, rest, children)
  }
  return {
    motion: new Proxy({}, { get: (_target, tag) => passthrough(tag) }),
    AnimatePresence: ({ children }) => children,
  }
})

function renderCreateTrip() {
  return render(
    <MemoryRouter>
      <CreateTrip />
    </MemoryRouter>
  )
}

beforeEach(() => {
  toastMock.mockClear()
  generateTripMock.mockClear()
})

describe('CreateTrip form validation', () => {
  it('shows a validation toast and does not call the AI when required fields are missing', async () => {
    renderCreateTrip()

    await userEvent.click(screen.getByRole('button', { name: /generate trip/i }))

    expect(toastMock).toHaveBeenCalledWith('Please fill all the details')
    expect(generateTripMock).not.toHaveBeenCalled()
  })

  it('shows the MAX_DAYS boundary message when noOfDays exceeds the limit', async () => {
    renderCreateTrip()

    await userEvent.type(screen.getByLabelText('Destination'), 'Goa')
    fireEvent.change(screen.getByPlaceholderText('Ex. 4'), { target: { value: '31' } })
    await userEvent.click(screen.getByText('Cheap'))
    await userEvent.click(screen.getByText('Just Me'))

    await userEvent.click(screen.getByRole('button', { name: /generate trip/i }))

    expect(toastMock).toHaveBeenCalledWith('Trips are limited to 30 days')
    expect(generateTripMock).not.toHaveBeenCalled()
  })
})
