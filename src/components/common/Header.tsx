import React from 'react'; 
 
const Header: React.FC = () => { 
  return ( 
    <header className="bg-white shadow-sm border-b"> 
      <div className="container mx-auto px-4 py-4"> 
        <h1 className="text-2xl font-bold text-gray-900">My App</h1> 
      </div> 
    </header> 
  ); 
}; 
 
export default Header; 
