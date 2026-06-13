import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RefreshCw } from 'lucide-react'
import Button from './Button'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log privately — never dump raw stack traces to standard consumer outputs
    console.error('[ErrorBoundary] Uncaught exception:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center p-6">
          <div className="w-full max-w-md p-6 rounded-2xl border border-danger/20 bg-surface text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-danger" />
            
            <div className="flex justify-center">
              <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-full">
                <AlertOctagon size={36} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                ZenPath encountered an unexpected layout crash. Don't worry, your journal drafts and local records are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-bg border border-border text-left">
                <span className="block text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">
                  Error Diagnostic
                </span>
                <span className="text-xs font-mono text-danger block break-words">
                  {this.state.error.name}: {this.state.error.message}
                </span>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={this.handleReload}
                variant="primary"
                className="flex items-center gap-1.5 font-bold"
              >
                <RefreshCw size={14} />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
