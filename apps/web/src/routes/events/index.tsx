import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/')({
  component: EventsListPage,
})

function EventsListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        <p className="text-muted-foreground">Events listing will be displayed here.</p>
      </div>
    </div>
  )
}
