// src/pages/HomePage.jsx
import React from 'react';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import MembershipSection from '../components/MembershipSection';
import EventsSection from '../components/EventsSection';
import PartnersSection from '../components/PartnersSection';
import ContactSection from '../components/ContactSection';

const HomePage = () => {
  return (
    <>
      <Hero />
      <AboutSection />
      <MembershipSection />
      <EventsSection />
      <PartnersSection />
      <ContactSection />
    </>
  );
};

export default HomePage;