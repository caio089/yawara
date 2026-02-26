import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-washi">
      <Sidebar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
