function Tasks() {
  const columns = [
    { title: "To Do", tasks: ["Write project brief", "Create wireframes"] },
    { title: "In Progress", tasks: ["Build landing page", "Set up database"] },
    { title: "Done", tasks: ["Kickoff meeting", "Choose tech stack"] },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="rounded bg-gray-200 p-4">
            <h3 className="mb-3 font-semibold">{column.title}</h3>

            {column.tasks.map((task) => (
              <div
                key={task}
                className="mb-2 rounded bg-white p-3 text-sm shadow"
              >
                {task}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
