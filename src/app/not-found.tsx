import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] bg-black text-white">
      <h1 className="text-9xl font-black text-red-600 italic underline decoration-white">
        404
      </h1>
      <p className="text-2xl font-black mt-4 uppercase">
        Refund Record Doesn&apos;t Exist
      </p>
      <Link
        href="/"
        className="mt-8 bg-white text-black px-6 py-3 font-black uppercase hover:bg-red-600 hover:text-white transition"
      >
        Return to Portal
      </Link>
    </main>
  );
}
