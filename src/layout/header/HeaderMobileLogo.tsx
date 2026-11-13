import Image from "next/image";
import Link from "next/link";

export default function HeaderMobileLogo() {
  return (
    <Link href="/" aria-label="EventSphere home" className="flex items-center gap-2 lg:hidden">
      <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-300 via-brand-500 to-brand-700 shadow-md shadow-brand-500/30">
        <Image src="/images/logo/eventsphere-mark-white.png" alt="" width={22} height={22} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        eventsphere
      </span>
    </Link>
  );
}
