import SafetyCard from './SafetyCard';
import SafetyPanel from './SafetyPanel';

export default function SafetyDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <SafetyCard />
                </div>
                <div className="w-full mb-3">
                    <SafetyPanel />
                </div>
            </div>
        </>
    );
}