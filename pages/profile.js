import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import ProfileScreen from '../src/screens/ProfileScreen'

export default function Profile() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <ProfileScreen />
      </main>
      <Footer />
    </div>
  )
}
