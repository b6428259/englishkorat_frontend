import React from "react";
import Link from "next/link";

const NavBar: React.FC = () => (
  <nav className="w-full flex items-center justify-between px-6 py-4 bg-[#334293] text-white shadow-md">
    <div className="font-bold text-lg">
      EnglishKorat
    </div>
    <div className="flex gap-6">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/studentRegistration">Student Registration</Link>
      <Link href="/">Home</Link>
    </div>
  </nav>
);

export default NavBar;
