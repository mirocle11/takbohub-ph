import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Create your account</h1>
        <p className="text-muted-foreground text-center">
          Registration form will be implemented here.
        </p>
      </div>
    </div>
  )
}
