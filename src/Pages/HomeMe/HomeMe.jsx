import React from 'react'
import NavbarMe from './NavbarMe/NavbarMe'
import HeroMe from './HeroMe/HeroMe'
import FeaturesSection from './FeaturesSection/FeaturesSection'
import PricingSection from './PricingSection/PricingSection'
import ClientsSection from './ClientsSection/ClientsSection'
import FooterSection from './Footer/FooterSection'

const HomeMe = () => {
  return (
    <div className='homme'>
      <NavbarMe/>
      <HeroMe/>
      <FeaturesSection/>
      <PricingSection/>
      <ClientsSection/>
      <FooterSection/>
    </div>
  )
}

export default HomeMe
