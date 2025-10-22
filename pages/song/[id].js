import Header from '../../src/components/Header'
import Footer from '../../src/components/Footer'
import SongPage from '../../src/screens/SongPage'

export default function Song() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <SongPage />
      </main>
      <Footer />
    </div>
  )
}
