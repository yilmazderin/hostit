import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { RequireRole } from './components/RequireRole'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Home } from './pages/customer/Home'
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireRole role="customer" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:categorySlug" element={<Category />} />
          <Route path="/vendors/:slug" element={<VendorProfile />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/plan/results" element={<PlanResults />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventBoard />} />
        </Route>

        <Route element={<RequireRole role="vendor" />}>
          <Route path="/vendor" element={<Dashboard />} />
          <Route path="/vendor/profile" element={<EditProfile />} />
          <Route path="/vendor/availability" element={<Availability />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
