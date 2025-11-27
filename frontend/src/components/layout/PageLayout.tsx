// components/LegalLayout.tsx
import { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <>
      <Navbar />
      <section className="w-full h-auto sm:px-20 !bg-background-light">
        <div className="flex flex-col items-start">{children}</div>
      </section>
      <Footer />
    </>
  );
};

export default PageLayout;
