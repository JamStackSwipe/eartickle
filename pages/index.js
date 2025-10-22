import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import HomePage from '../src/screens/HomePage'

export default function Home() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}
