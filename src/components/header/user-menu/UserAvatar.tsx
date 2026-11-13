import { User } from "lucide-react";
import { cn } from "@/utils/cn";

const getInitials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

type Props = { name?: string; src?: string; className?: string };

export default function UserAvatar({ name, src, className }: Props) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-brand-300 to-brand-600 text-sm font-semibold text-white ring-2 ring-white dark:ring-gray-900",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "User profile"} className="size-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <User className="size-5" />
      )}
    </span>
  );
}
