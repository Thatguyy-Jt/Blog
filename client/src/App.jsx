import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/Toaster.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NewPost from './pages/NewPost.jsx'
import EditPost from './pages/EditPost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CategoryManager from './pages/CategoryManager.jsx' // 1. Import the new component
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
   return (
    <AuthProvider>
       <div className="min-h-screen flex flex-col">
          <Navbar />
      
       <main className="flex-1 container-responsive py-8">
       <Routes>
       {/* Public routes */}
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/posts/:id" element={<PostDetail />} />

         {/* Protected routes */}
          <Route
           path="/dashboard"
           element={
           <ProtectedRoute>
           <Dashboard />
      </ProtectedRoute>
          }/>

         <Route
         path="/posts/new"
         element={
         <ProtectedRoute>
         <NewPost />
         </ProtectedRoute>
        } />

          <Route
             path="/posts/:postId/edit"
            element={
           <ProtectedRoute>
           <EditPost />
           </ProtectedRoute>
           } />

            {/* 2. New Protected Route for Admin Category Management */}
             <Route
             path="/admin/categories"
             element={
             <ProtectedRoute>
             <CategoryManager />
             </ProtectedRoute>
           }/>
    </Routes>
      </main>
      <Footer />
      <Toaster />
     </div>
    </AuthProvider>
  )
}