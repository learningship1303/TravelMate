import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('TravelMate crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="focus-ring bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
