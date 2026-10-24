function Overview() {
  const stats = [
    { label: "Projects", value: 6 },
    { label: "Open tasks", value: 24 },
    { label: "Completed", value: 58 },
    { label: "Team members", value: 9 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
