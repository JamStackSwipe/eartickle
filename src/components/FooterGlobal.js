import React from 'react';
import Header from './Header';
import Footer from './Footer';

const FooterGlobal = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default FooterGlobal
