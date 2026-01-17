import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Log in to TakboHub</h1>
        <p className="text-muted-foreground text-center">Login form will be implemented here.</p>
      </div>
    </div>
  )
}
