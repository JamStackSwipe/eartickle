import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import Privacy from '../src/screens/Privacy'

export default function PrivacyPage() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <Privacy />
      </main>
      <Footer />
    </div>
  )
}
