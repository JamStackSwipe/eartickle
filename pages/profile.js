import Header from '../components/Header'
import Footer from '../components/Footer'
import ProfileScreen from '../screens/ProfileScreen'

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
