import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import JamStackScreen from '../src/screens/JamStackScreen'

export default function JamStack() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <JamStackScreen />
      </main>
      <Footer />
    </div>
  )
}
