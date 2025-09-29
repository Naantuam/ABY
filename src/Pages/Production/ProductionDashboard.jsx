import OperationsChart from '../AdminDashboard/Chart';
import ProductionPanel from './ProductionPanel';

export default function ProductionDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <OperationsChart />
                </div>
                <div className="w-full mb-3">
                    <ProductionPanel />
                </div>
            </div>
        </>
    );
}