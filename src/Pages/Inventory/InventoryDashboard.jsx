import InventoryCard from './InventoryCard';
import InventoryPanel from './InventoryPanel';

export default function InventoryDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <InventoryCard />
                </div>
                <div className="w-full mb-3">
                    <InventoryPanel />
                </div>
            </div>
        </>
    );
}