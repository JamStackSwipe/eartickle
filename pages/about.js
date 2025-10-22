import Header from '../components/Header'
import Footer from '../components/Footer'
import About from '../screens/AboutScreen'

export default function AboutPage() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <About />
      </main>
      <Footer />
    </div>
  )
}
