// components/LegalLayout.tsx
import { ReactNode } from "react";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <>
      <Navbar />
      <section className="w-full h-auto py-20  px-8 sm:px-20 !bg-background-light">
        <div className="flex flex-col items-center">{children}</div>
      </section>
      <Footer />
    </>
  );
};

export default PageLayout;
