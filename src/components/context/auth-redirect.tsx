'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

import { Spinner } from '../ui/spinner';

export type AuthRedirectProps = {
  children: React.ReactNode;
};
export default function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'unauthenticated') {
    signIn();
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="flex flex-col justify-center">
        <Spinner size="large" />
        <p>読み込み中...</p>
      </div>
    </div>
  );
}
