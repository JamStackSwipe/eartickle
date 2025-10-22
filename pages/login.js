import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import LoginScreen from '../src/screens/LoginScreen'

export default function Auth() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <LoginScreen />
      </main>
      <Footer />
    </div>
  )
}
