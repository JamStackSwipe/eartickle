import Header from '../components/Header'
import Footer from '../components/Footer'
import Privacy from '../screens/Privacy'

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
