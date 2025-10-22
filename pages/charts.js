import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import ChartsScreen from '../src/screens/ChartsScreen'

export default function Charts() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <ChartsScreen />
      </main>
      <Footer />
    </div>
  )
}
