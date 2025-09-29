import OperationsChart from './Chart'
import CardInfo from './StatInfo';
import RecentActivity from './RecentActivity';


export default function Dashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <OperationsChart />
                </div>
                <div className="w-full mb-3">
                    <CardInfo />
                </div>
                <div className="w-full mb-3">
                    <RecentActivity />
                </div>
            </div>
        </>
    );
}
