function Projects() {
  const projects = [
    { id: 1, name: "Website Redesign", progress: 65 },
    { id: 2, name: "Mobile App", progress: 20 },
    { id: 3, name: "Marketing Campaign", progress: 100 },
    { id: 4, name: "Internal Tools", progress: 40 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Projects</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="rounded bg-white p-5 shadow">
            <h3 className="font-semibold">{project.name}</h3>

            <div className="mt-3 h-2 rounded bg-gray-200">
              <div
                className="h-2 rounded bg-indigo-600"
                style={{ width: project.progress + "%" }}
              ></div>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {project.progress}% done
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
