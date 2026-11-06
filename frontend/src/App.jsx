import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Loader } from './components/ui'
import { Layout } from './components/Layout'
import { Login, Register } from './pages/AuthPages'
import { DonationForm, DonationList } from './pages/DonorPages'
import { Dashboard, BrowseDonations, Requests } from './pages/SharedPages'
import { AdminDonations, NgoVerification, Reports, Users } from './pages/AdminPages'
import { Profile } from './pages/Profile'
function Protected({ roles, children }) { const { user, loading } = useAuth(); if (loading) return <Loader/>; if (!user) return <Navigate to="/login" replace/>; if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>; return children }
export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route element={<Protected><Layout/></Protected>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/profile" element={<Profile/>}/><Route path="/requests" element={<Requests/>}/><Route path="/browse" element={<Protected roles={['NGO']}><BrowseDonations/></Protected>}/><Route path="/donations" element={<Protected roles={['DONOR', 'ADMIN']}>{<DonationSwitch/>}</Protected>}/><Route path="/donations/new" element={<Protected roles={['DONOR']}><DonationForm/></Protected>}/><Route path="/users" element={<Protected roles={['ADMIN']}><Users/></Protected>}/><Route path="/ngos" element={<Protected roles={['ADMIN']}><NgoVerification/></Protected>}/><Route path="/reports" element={<Protected roles={['ADMIN']}><Reports/></Protected>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes> }
function DonationSwitch() { const { user } = useAuth(); return user.role === 'ADMIN' ? <AdminDonations/> : <DonationList/> }
