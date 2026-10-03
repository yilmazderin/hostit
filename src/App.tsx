import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { RequireRole } from './components/RequireRole'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { About } from './pages/public/About'
import { Services } from './pages/public/Services'
import { Contact } from './pages/public/Contact'
import { Terms } from './pages/public/Terms'
import { Privacy } from './pages/public/Privacy'
import { SignUp } from './pages/account/SignUp'
import { JoinNetwork } from './pages/account/JoinNetwork'
import { Account } from './pages/account/Account'
import { CustomerDashboard } from './pages/customer/Dashboard'
import { Explore } from './pages/customer/Explore'
import { Category } from './pages/customer/Category'
import { VendorProfile } from './pages/customer/VendorProfile'
import { Plan } from './pages/customer/Plan'
import { PlanResults } from './pages/customer/PlanResults'
import { Events } from './pages/customer/Events'
import { EventBoard } from './pages/customer/EventBoard'
import { Dashboard } from './pages/vendor/Dashboard'
import { EditProfile } from './pages/vendor/EditProfile'
import { Availability } from './pages/vendor/Availability'
import { Applications } from './pages/admin/Applications'

// new page: start at the top, or at the #section the link points to (e.g. /terms#vendors)
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// old /explore/:slug links keep working
function LegacyCategory() {
  const { categorySlug } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/network/${categorySlug}${search}`} replace />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* public: anyone can learn about host it and browse the network */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/network" element={<Explore />} />
        <Route path="/network/:categorySlug" element={<Category />} />
        <Route path="/vendors/:slug" element={<VendorProfile />} />
        {/* planning can be explored signed out; saving it needs an account */}
        <Route path="/plan" element={<Plan />} />
        <Route path="/plan/results" element={<PlanResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/join" element={<JoinNetwork />} />

        <Route path="/explore" element={<Navigate to="/network" replace />} />
        <Route path="/explore/:categorySlug" element={<LegacyCategory />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

        <Route element={<RequireRole role="customer" />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventBoard />} />
        </Route>

        <Route element={<RequireRole />}>
          <Route path="/account" element={<Account />} />
        </Route>

        <Route element={<RequireRole role="vendor" />}>
          <Route path="/vendor" element={<Dashboard />} />
          <Route path="/vendor/profile" element={<EditProfile />} />
          <Route path="/vendor/availability" element={<Availability />} />
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<Applications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
