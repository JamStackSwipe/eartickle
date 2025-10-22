import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import About from '../src/screens/AboutScreen'

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
