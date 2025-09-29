import ProjectCard from './ProjectCard';
import ProjectPanel from './ProjectPanel';

export default function ProjectDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <ProjectCard />
                </div>
                <div className="w-full mb-3">
                    <ProjectPanel />
                </div>
            </div>
        </>
    );
}