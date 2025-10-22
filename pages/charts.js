import Header from '../components/Header'
import Footer from '../components/Footer'
import ChartsScreen from '../screens/ChartsScreen'

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
