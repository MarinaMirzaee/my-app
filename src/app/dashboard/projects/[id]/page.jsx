"use client";
import { useParams } from "next/navigation";
import ProjectDetail from "../../../../legacy-pages/ProjectDetail";
export default function Page() { const { id } = useParams(); return <ProjectDetail id={id} />; }
