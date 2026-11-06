import { useState } from "react";
import SearchFilter from "../components/SearchFilter";
import { filterBySearch } from "../utils/filter";

function Team() {
  const [search, setSearch] = useState("");
  const members = [
    { id: 1, name: "Sara Ahmadi", role: "Project Manager" },
    { id: 2, name: "Marina Mirzaee", role: "Frontend Developer" },
    { id: 3, name: "Rana Soofizada", role: "UI/UX Designer" },
    { id: 4, name: "Mohammad Hashemi", role: "Backend Developer" },
  ];
  const filteredMembers = filterBySearch(members, search);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Team</h1>

      <SearchFilter
        value={search}
        onSearchChange={setSearch}
        placeholder="Search all team fields..."
        resultCount={filteredMembers.length}
        totalCount={members.length}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredMembers.length === 0 && (
          <p className="text-sm text-gray-500">No team members match.</p>
        )}
        {filteredMembers.map((member) => (
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
