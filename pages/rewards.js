import Header from '../src/components/Header'
import Footer from '../src/components/Footer'
import RewardsScreen from '../src/screens/RewardsScreen'

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
