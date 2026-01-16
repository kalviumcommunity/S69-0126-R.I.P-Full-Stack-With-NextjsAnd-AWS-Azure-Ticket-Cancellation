export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Component Architecture Working ✅</h1>

      <p className="text-gray-600">
        If you can see the Header at the top and Sidebar on the left, your
        reusable layout is successfully applied.
      </p>

      <div className="rounded-lg border p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">What this proves</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            Global layout is applied via <code>app/layout.tsx</code>
          </li>
          <li>Header and Sidebar are reusable components</li>
          <li>Page content renders inside LayoutWrapper</li>
          <li>No backend or database changes</li>
        </ul>
      </div>
    </div>
  );
}
