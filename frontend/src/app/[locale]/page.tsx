
import Navbar from "@/app/components/Navbar";
import Header from "@/app/components/Header";
import ServiceProcess from "@/app/components/ServiceProcess";
import Footer from "@/app/components/Footer";


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
