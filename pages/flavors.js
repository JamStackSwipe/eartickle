import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import FlavorsScreen from '../src/screens/FlavorsScreen'

export default function Flavors() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <FlavorsScreen />
      </main>
      <Footer />
    </div>
  )
}
