import Header from '../components/Header'
import Footer from '../components/Footer'
import HomePage from '../screens/HomePage'

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
