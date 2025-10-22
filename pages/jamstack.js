import Header from '../components/Header'
import Footer from '../components/Footer'
import JamStackScreen from '../screens/JamStackScreen'

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
