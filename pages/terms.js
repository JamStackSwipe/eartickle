import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import Terms from '../src/screens/Terms'

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
