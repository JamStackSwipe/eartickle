import Header from '../components/Header'
import Footer from '../components/Footer'
import FlavorsScreen from '../screens/FlavorsScreen'

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
