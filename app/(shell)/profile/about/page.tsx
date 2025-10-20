export default function ProfileAboutPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Left: Bio card */}
      <section className="xl:col-span-8">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">
            Hi, I’m Abinash. I love building useful interfaces and connecting with neighbors.
            You’ll usually find me exploring local coffee spots, organizing small community
            meetups, or sharing updates about what’s happening around Maple Grove.
          </p>
        </div>
      </section>

      {/* Right: Details */}
      <aside className="xl:col-span-4 space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Neighborhood</h3>
          <dl className="mt-2 text-sm text-slate-700">
            <div className="flex justify-between py-1">
              <dt className="text-slate-500">Area</dt>
              <dd>Maple Grove</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-slate-500">Member since</dt>
              <dd>2024</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-slate-500">Posts</dt>
              <dd>23</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Email: abinash@example.com</li>
            <li>Phone: (555) 123-4567</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
