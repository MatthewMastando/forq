import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { RecipeEditor } from './pages/RecipeEditor';
import { Profile } from './pages/Profile';
import { ProfileEdit } from './pages/ProfileEdit';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { ForkView } from './pages/ForkView';
import { SharedRecipe } from './pages/SharedRecipe';
import { AuthProvider } from './context/AuthContext';
import { RecipeProvider } from './context/RecipeContext';
import { Analytics } from "@vercel/analytics/react";
export function App() {
  console.log('App component rendering');
  return <Router>
      <AuthProvider>
        <RecipeProvider>
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8EA] to-[#F8EAD8]">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/create" element={<RecipeEditor />} />
                <Route path="/edit/:id" element={<RecipeEditor />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/profile/:username/edit" element={<ProfileEdit />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/recipe/:id/forks" element={<ForkView />} />
                <Route path="/r/:id" element={<SharedRecipe />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Analytics />
        </RecipeProvider>
      </AuthProvider>
    </Router>;
}