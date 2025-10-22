import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import SwipeScreen from '../src/screens/SwipeScreen'

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
