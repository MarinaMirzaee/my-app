function Team() {
  const members = [
    { id: 1, name: "Sara Ahmadi", role: "Project Manager" },
    { id: 2, name: "Marina Mirzaee", role: "Frontend Developer" },
    { id: 3, name: "Rana Soofizada", role: "UI/UX Designer" },
    { id: 4, name: "Mohammad Hashemi", role: "Backend Developer" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Team</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded bg-white p-5 text-center shadow"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
              {member.name[0]}
            </div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
