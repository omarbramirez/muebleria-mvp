'use client'
import React, { useState } from 'react'
import { setCategories } from '@/app/assets/assets';
import PageLayout from "@/components/layout/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/components/ui/Heading';
import { Paragraph } from '@/components/ui/Paragraph';
import { LinkItem } from "@/components/ui/LinkItem";
import { Button } from '@/components/ui/Button';
import Introduction from '@/components/features/home/Introduction'
import Module from '@/components/features/planner/Module';

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


