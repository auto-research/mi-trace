"use client";
import * as RadixTabs from '@radix-ui/react-tabs';
import React from 'react';

export const Tabs = RadixTabs.Root;
export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof RadixTabs.List>>(
  (props, ref) => (
    <RadixTabs.List ref={ref} {...props} className={"inline-flex bg-gray-100 rounded-lg p-1 " + (props.className || "")}/>
  )
);
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>>(
  (props, ref) => (
    <RadixTabs.Trigger
      ref={ref}
      {...props}
      className={
        `px-4 py-2 rounded-lg text-base font-medium transition-colors duration-150
        data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-orange-600
        data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-white/80
        focus:outline-none ` + (props.className || "")
      }
    />
  )
);
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = RadixTabs.Content; 