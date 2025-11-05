'use client'
import React, { useState } from 'react'
import { setCategories } from '@/app/assets/assets';
import PageLayout from "@/app/components/ui/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";
import { Button } from '@/app/components/ui/Button';
import Introduction from '@/app/components/Introduction'
import Module from '@/app/components/Module';

const Explore = () => {
  const t = useTranslations("pop_ups.wizard")
  return(
    <PageLayout>
      <Introduction page='explore'/>
      <Module  section='sets' asset={setCategories}/>
    </PageLayout>
  )
}

export default Explore;


