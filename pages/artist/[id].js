import Header from '../../src/components/Header'
import Footer from '../../src/components/Footer'
import ArtistProfileScreen from '../../src/screens/ArtistProfileScreen'

export default function ArtistProfile() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <ArtistProfileScreen />
      </main>
      <Footer />
    </div>
  )
}
