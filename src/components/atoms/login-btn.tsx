'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function LoginBtn() {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <>
        <Avatar>
          {session.user?.image && <AvatarImage src={session.user.image} />}
          <AvatarFallback>
            {session.user.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
