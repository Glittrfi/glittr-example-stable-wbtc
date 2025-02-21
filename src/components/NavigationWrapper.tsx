"use client";

import Navbar from './Navbar';

export default function NavigationWrapper() {
  const showNavbar = true;

  return showNavbar ? <Navbar /> : null;
}