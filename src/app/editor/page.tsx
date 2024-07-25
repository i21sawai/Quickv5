// redirect to /editor/[id]

import { redirect } from 'next/navigation';
import { makeid } from '@/utils/str';

export default function Page() {
  redirect(`/editor/${makeid(10)}`);
}
