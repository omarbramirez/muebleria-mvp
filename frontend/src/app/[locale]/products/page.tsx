'use client'
import React, { useState }  from 'react'
import PageLayout from "@/app/components/ui/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";
import Header from '@/app/components/Header';
import ProductCatalog from '@/app/components/Catalog';
import Introduction from '@/app/components/Introduction'


const Products = () => {
return (
  <PageLayout>
    <Introduction page='catalog'/>
  <ProductCatalog/>
  </PageLayout>
  
  );
}

export default Products;

