import { useState } from "react";

import SearchFilter from "../components/SearchFilter";
import LoadingState from "../components/LoadingState";

import { useUsers } from "../hooks/useUsers";

import { filterBySearch } from "../utils/filter";

function Team() {
  const usersQuery = useUsers();

  const [search, setSearch] = useState("");

  if (usersQuery.isPending) {
    return <LoadingState message="Loading team..." />;
  }

  if (usersQuery.isError) {
    return <p className="text-sm text-red-600">Could not load users.</p>;
  }

  const members = usersQuery.data;

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

            <p className="mt-1 text-xs text-gray-400">{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
