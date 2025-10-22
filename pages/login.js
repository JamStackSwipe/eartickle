import Header from '../components/Header'
import Footer from '../components/Footer'
import LoginScreen from '../screens/LoginScreen'

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
