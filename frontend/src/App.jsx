import React from 'react'
import Start from './pages/Start.jsx'
import UserLogin from './pages/UserLogin.jsx'
import UserSignup from './pages/UserSignup.jsx'
import CaptainLogin from './pages/CaptainLogin.jsx'
import CaptainSignup from './pages/CaptainSignup.jsx'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CaptainHome from './pages/CaptainHome.jsx'
import UserRestrictedWrapper from './pages/UserRestrictedWrapper.jsx'
import UserLogout from './pages/UserLogout.jsx'
import CaptainRestrictedWrapper from './pages/CaptainRestrictedWrapper.jsx'
import CaptainLogout from './pages/CaptainLogout.jsx'
import CaptainRideNavigation from './pages/CaptainRideNavigation.jsx'

const App = () => {
  return (
    <Routes>
      <Route path= "/" element={<Start/>}/>
      <Route path="/login" element={<UserLogin/>}/>
      <Route path="/signup" element={<UserSignup/>}/>
      <Route path="/captain-login" element={<CaptainLogin/>}/>
      <Route path="/captain-signup" element={<CaptainSignup/>}/>
      <Route path="/home" element={
        <UserRestrictedWrapper>
          <Home/>
        </UserRestrictedWrapper>
      }/>
      <Route path="/captain-home" element={
        <CaptainRestrictedWrapper>
          <CaptainHome/>
        </CaptainRestrictedWrapper>
      }/>
      <Route path="/logout" element={
        <UserRestrictedWrapper>
          <UserLogout/>
        </UserRestrictedWrapper>
      }/>

      <Route path="/captain-logout" element={
        <CaptainRestrictedWrapper>
          <CaptainLogout/>
        </CaptainRestrictedWrapper>
      }/>
      <Route path="/captain-ride" element={
        <CaptainRestrictedWrapper>
          <CaptainRideNavigation/>
        </CaptainRestrictedWrapper>
      }/>
      <Route path="/user-ride" element={
        <UserRestrictedWrapper>
          <CaptainRideNavigation/>
        </UserRestrictedWrapper>
      }/>
    </Routes>
  )
}

export default App