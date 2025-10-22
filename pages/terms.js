import Header from '../components/Header'
import Footer from '../components/Footer'
import Terms from '../screens/Terms'

export default function TermsPage() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <Terms />
      </main>
      <Footer />
    </div>
  )
}
