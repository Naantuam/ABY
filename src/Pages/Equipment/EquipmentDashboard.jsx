import EquipmentCard from './EquipmentCard'
import EquipmentPanel from './EquipmentPanel';

export default function EquipmentDashboard() {
    return (
        <>
            <div className="flex-1 w-full h-full flex flex-col overflow-auto bg-gray-50">
                <div className="w-full">
                    <EquipmentCard />
                </div>
                <div className="w-full mb-3">
                    <EquipmentPanel />
                </div>
            </div>
        </>
    );
}