// components/LegalLayout.tsx
import { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Heading } from "@/app/components/ui/Heading";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => {
  return (
    <>
    <Navbar/>
    <section className="w-full h-auto py-20  px-8 sm:px-20 !bg-background-light">
       <Heading
                as="h1"
                variant="primary"
                size="lg"
                hierarchy="forSection"
              >
                {title}
              </Heading>

      <div className="flex flex-col items-center">{children}</div>
    </section>
    <Footer/>
    </>
  );
};

export default LegalLayout;
