// app/users/[id]/page.tsx
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;

  // Mocking a database delay/fetch
  const user = {
    id,
    name: `User ${id}`,
    role: id === "1" ? "System Administrator" : "Standard Personnel",
    email: `user${id}@rip-protocol.com`,
    joined: "January 2026",
  };

  const isAdmin = id === "1";

  return (
    <main className="min-h-[90vh] bg-[#0F172A] p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Breadcrumbs - Softened */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-rose-500 transition-colors">Directory</Link>
          <span>/</span>
          <span className="text-slate-300">Profile_{id}</span>
        </nav>

        {/* Profile Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
          
          {/* Top Banner Accent */}
          <div className={`h-32 w-full bg-gradient-to-r ${isAdmin ? 'from-blue-600 to-indigo-900' : 'from-rose-600 to-orange-900'} opacity-50`} />

          <div className="px-8 pb-10 -mt-16 relative">
            {/* Avatar Placeholder */}
            <div className="h-32 w-32 bg-slate-900 border-4 border-[#0F172A] rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-xl mb-6">
              {user.name.charAt(user.name.length - 1)}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                  {user.name}
                </h1>
                <p className="text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {user.role}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-600">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-700/50 w-full my-8" />

            {/* Stats/Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Address</p>
                <p className="text-slate-200 font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Account Status</p>
                <p className="text-emerald-400 font-medium italic">Verified & Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Network Tier</p>
                <p className="text-slate-200 font-medium">Level {isAdmin ? '0 (Root)' : '4 (User)'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Authorization Date</p>
                <p className="text-slate-200 font-medium">{user.joined}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <p className="text-center text-slate-600 text-[10px] uppercase tracking-[0.3em]">
          End-to-End Encrypted Profile Access
        </p>
      </div>
    </main>
  );
}