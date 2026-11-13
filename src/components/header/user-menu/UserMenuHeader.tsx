import type { UserProfile } from "@/types/profile.types";
import UserAvatar from "./UserAvatar";

type Props = { profile: UserProfile | null; roleLabel?: string };

export default function UserMenuHeader({ profile, roleLabel }: Props) {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-brand-700 via-brand-600 to-brand-500 px-4 pb-4 pt-5 text-white">
      <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <UserAvatar name={profile?.name} src={profile?.profilePic} className="size-12 ring-white/30" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile?.name ?? "Loading..."}</p>
          <p className="truncate text-xs text-white/75">{profile?.email ?? ""}</p>
          {roleLabel && (
            <span className="mt-1.5 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {roleLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
