'use client'
import React, { useState }  from 'react'
import PageLayout from "@/components/layout/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/components/ui/Heading';
import { Paragraph } from '@/components/ui/Paragraph';
import { LinkItem } from "@/components/ui/LinkItem";
import Header from '@/components/layout/Header';
import ProductCatalog from '@/components/features/catalog/Catalog';
import Introduction from '@/components/features/home/Introduction'


const Products = () => {
return (
  <PageLayout>
    <Introduction page='catalog'/>
  <ProductCatalog/>
  </PageLayout>
  
  );
}

export default Products;

