import React from "react";

export default function NeighborsPage() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <h1 className="text-lg font-semibold text-gray-800">Neighbors</h1>
        <p className="mt-1 text-sm text-gray-700">Browse and connect with people nearby.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {["Aditi", "Bipin", "Chirag", "Diya"].map((n) => (
          <div
            key={n}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                className="h-10 w-10 rounded-full object-cover"
                alt="avatar"
              />
              <div>
                <div className="text-sm font-semibold text-gray-800">{n}</div>
                <div className="text-xs text-gray-500">Neighbor • 300m away</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
