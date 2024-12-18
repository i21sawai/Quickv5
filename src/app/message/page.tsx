'use client';

import { useSearchParams } from 'next/navigation';

export default function Page() {
  //read value from query
  const params = useSearchParams();
  console.log(params);
  const title = params.get('title');
  const message = params.get('message');

  return (
    <div className="flex h-[320px] flex-col items-center justify-center gap-8 p-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {title}
      </h1>
      <h2 className="text-2xl  text-muted-foreground">{message}</h2>
    </div>
  );
}
