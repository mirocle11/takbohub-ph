import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl">TakboHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse Events
              </Link>
              <Link to="/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Find and Join Running Events
          <br />
          <span className="text-primary">in the Philippines</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Discover local fun runs, marathons, and trail races. Register and pay seamlessly with GCash, Maya, or card.
          Your next PR awaits!
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link to="/events">
            <Button size="lg" className="px-8">
              Browse Events
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="px-8">
              Organize an Event
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">1</span>
              </div>
              <CardTitle>Find an Event</CardTitle>
              <CardDescription>
                Browse upcoming running events in your area or search for specific races.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">2</span>
              </div>
              <CardTitle>Register & Pay</CardTitle>
              <CardDescription>
                Fill in your details and pay instantly with GCash, Maya, card, or bank transfer.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">3</span>
              </div>
              <CardTitle>Run!</CardTitle>
              <CardDescription>
                Get instant confirmation, show up on race day, and achieve your personal best.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* For Organizers */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Race Organizers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop juggling Google Forms, GCash screenshots, and spreadsheets. TakboHub handles it all.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Event Pages', desc: 'Beautiful, shareable event pages' },
              { title: 'Online Payments', desc: 'GCash, Maya, cards - auto-confirmed' },
              { title: 'Participant Management', desc: 'Track registrations in real-time' },
              { title: 'Easy Exports', desc: 'Download data for race kits and bibs' },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-semibold">TakboHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TakboHub. Made with love in Dumaguete City.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
