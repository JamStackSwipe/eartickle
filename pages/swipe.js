import Header from '../components/Header'
import Footer from '../components/Footer'
import SwipeScreen from '../screens/SwipeScreen'

export default function Swipe() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <SwipeScreen />
      </main>
      <Footer />
    </div>
  )
}
