
import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import ServiceProcess from "@/components/features/home/ServiceProcess";
import Footer from "@/components/layout/Footer";


export default function Home() {
  return (
    <div>
      <Navbar/>
      <Header/>
      <ServiceProcess/>  
      <Footer/> 
    </div>
  );
}
