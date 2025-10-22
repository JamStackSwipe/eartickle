import Header from '../components/Header'
import Footer from '../components/Footer'
import SettingsScreen from '../screens/SettingsScreen'

export default function Settings() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <SettingsScreen />
      </main>
      <Footer />
    </div>
  )
}
