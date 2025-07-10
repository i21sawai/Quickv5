'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@udecode/cn';
import { useSession } from 'next-auth/react';

import { NavItem } from '@/types/nav';
import { siteConfig } from '@/config/site';

import { useEditorContext } from '../context/editor';

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const { data } = useSession();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items
            ?.filter((i) => {
              return data?.user?.email &&
                JSON.parse(data?.user?.email).role === '管理者'
                ? true
                : i.title !== '作成' && i.title !== '使い方ガイド';
            })
            .map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium text-muted-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80'
                    )}
                  >
                    {item.title}
                  </Link>
                )
            )}
        </nav>
      ) : null}
    </div>
  );
}
