import Header from '../components/Header'
import Footer from '../components/Footer'
import RewardsScreen from '../screens/RewardsScreen'

export default function Rewards() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <RewardsScreen />
      </main>
      <Footer />
    </div>
  )
}
