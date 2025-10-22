import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import SettingsScreen from '../src/screens/SettingsScreen'

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
