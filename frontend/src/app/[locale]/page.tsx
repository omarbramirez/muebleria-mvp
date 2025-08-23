import Image from "next/image";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import TabMenu from "../components/TabMenu";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Header/>
      <TabMenu/>
      <Contact/>
    </div>
  );
}
