import React from 'react'; 
import Head from 'next/head'; 
import Header from './Header'; 
import Footer from './Footer'; 
 
interface LayoutProps { 
  children: React.ReactNode; 
  title?: string; 
  description?: string; 
} 
 
const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'My App', 
  description = 'Description of my app' 
}) => { 
  return ( 
    <> 
      <Head> 
        <title>{title}</title> 
        <meta name="description" content={description} /> 
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
      </Head> 
      <div className="min-h-screen flex flex-col"> 
        <Header /> 
        <main className="flex-1 container mx-auto px-4 py-8"> 
          {children} 
        </main> 
        <Footer /> 
      </div> 
    </> 
  ); 
}; 
 
export default Layout; 
