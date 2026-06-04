function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Overview
        </h1>

        <p className="text-slate-500 mt-1">
          System status at a glance
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-80 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <span>🔍</span>

          <input
            placeholder="Search..."
            className="outline-none bg-transparent"
          />
        </div>

        <button className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          🔔
        </button>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          A
        </div>
      </div>
    </div>
  );
}

export default Header;