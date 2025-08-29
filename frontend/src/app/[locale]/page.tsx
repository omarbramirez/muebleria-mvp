import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Header from "@/app/components/Header";
import TabMenu from "@/app/components/TabMenu";
import Contact from "@/app/components/Contact";
import ProductGrid from "@/app/components/ProductGrid";
import NewsletterForm from "@/app/components/NewsletterForm";
import Footer from "@/app/components/Footer";
import StyleGuide from "../components/StyleGuide";


export default function Home() {
  return (
    <div>
      <Navbar/>
      <Header/>
      <TabMenu/>
      {/*
      <Contact/>
      <ProductGrid/>
      <NewsletterForm/>
      <Footer/> */}
      {/* <StyleGuide/> */}
    </div>
  );
}
