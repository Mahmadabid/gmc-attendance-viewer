// SafeBunkCalculator.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface SafeBunkCalculatorProps {
    totalClasses: number;
    presentClasses: number;
    leaveClasses: number;
    minPercentage?: number;
}

const SafeBunkCalculator: React.FC<SafeBunkCalculatorProps> = ({
    totalClasses,
    presentClasses,
    leaveClasses,
    minPercentage: defaultMinPercentage = 85
}) => {
    const [safeBunks, setSafeBunks] = useState(0);
    const [currentPercentage, setCurrentPercentage] = useState("0.00");
    const [minPercentage, setMinPercentage] = useState(defaultMinPercentage);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllDetails, setShowAllDetails] = useState(false);
    const [projectedPercentage, setProjectedPercentage] = useState("0.00");
    const [effectiveFutureTotal, setEffectiveFutureTotal] = useState<number>(0);

    useEffect(() => {
        const effectiveTotal = totalClasses - leaveClasses;

        const currentPercent = effectiveTotal === 0 ? 100 : effectiveTotal > 0
            ? (presentClasses / effectiveTotal * 100)
            : 0;
        setCurrentPercentage(currentPercent.toFixed(2));

        if (currentPercent < minPercentage) {
            setSafeBunks(0);
            setProjectedPercentage(currentPercent.toFixed(2));
            setEffectiveFutureTotal(effectiveTotal);
            return;
        }

        const maxFutureAbsents = Math.floor((presentClasses * 100 / minPercentage) - effectiveTotal);
        const safeBunksCount = Math.max(0, maxFutureAbsents);

        if (safeBunksCount > 0) {
            const newTotal = effectiveTotal + safeBunksCount;
            const projectedPercent = newTotal > 0 ? (presentClasses / newTotal * 100) : 0;
            setProjectedPercentage(projectedPercent.toFixed(2));
            setEffectiveFutureTotal(newTotal);
        } else {
            setProjectedPercentage(currentPercent.toFixed(2));
            setEffectiveFutureTotal(effectiveTotal);
        }

        setSafeBunks(safeBunksCount);
    }, [totalClasses, presentClasses, leaveClasses, minPercentage]);

    const getBunkStatusColor = () => {
        if (safeBunks === 0) return "text-red-600";
        if (safeBunks <= 2) return "text-orange-500";
        return "text-green-600";
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleShowDetails = () => {
        setShowAllDetails(!showAllDetails);
    };    
    return (
        <div className="p-2 min-[360px]:p-4 pb-4 bg-white rounded-lg shadow border border-secondary/30 max-w-md mx-auto mb-6">
            <div className="flex max-[315px]:flex-col justify-between items-center mb-2">
                <h3 className="text-lg min-[360px]:text-xl font-bold text-secondary">Safe Bunk Calculator</h3>
                <button
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    onClick={toggleExpand}
                >
                    {isExpanded ? "Hide Options" : "Show Options"}
                </button>
            </div>

            {showAllDetails && (
                <p className="text-sm mb-3 text-gray-600">
                    Estimate how many classes you can safely miss while maintaining at least {minPercentage}% attendance.
                    <br />
                    <span className="italic text-xs text-gray-500">
                        Leave classes are subtracted from total for calculations.
                    </span>
                </p>
            )}

            {isExpanded && (
                <div className="mb-4 p-2 min-[360px]:p-3 bg-gray-50 rounded-md">
                    <label className="block text-xs min-[360px]:text-sm font-medium text-gray-700 mb-1">
                        Minimum Required Attendance (%)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="75"
                            max="95"
                            step="1"
                            value={minPercentage}
                            onChange={(e) => setMinPercentage(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <span className="bg-secondary text-white px-2 py-1 rounded text-xs min-[360px]:text-sm min-w-[36px] text-center">
                            {minPercentage}%
                        </span>
                    </div>
                </div>
            )}            
            {showAllDetails && (
                <div className="grid grid-cols-1 text-center min-[360px]:grid-cols-2 gap-2 min-[360px]:gap-4 mb-4">
                    <div>
                        <span className="text-xs min-[360px]:text-sm font-medium text-gray-600">Current Attendance:</span>
                        <div className={`text-base min-[360px]:text-lg font-bold ${parseFloat(currentPercentage) >= minPercentage ? "text-green-600" : "text-red-600"}`}>
                            {currentPercentage}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Present: {presentClasses} | Counted Classes: {totalClasses - leaveClasses} (Excludes {leaveClasses} leaves)
                        </div>
                    </div>
                    <div className='min-[360px]:hidden border-b-2 border-b-gray-200 my-1'></div>
                    <div>
                        <span className="text-xs min-[360px]:text-sm font-medium text-gray-600">Required Attendance:</span>
                        <div className="text-base min-[360px]:text-lg font-bold text-secondary">{minPercentage}%</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Leaves: {leaveClasses} | Total Classes: {totalClasses}
                        </div>
                    </div>
                </div>
            )}            
            <div className="border-t border-gray-400 pt-3 relative">
                {!showAllDetails && (
                    <div className="text-center text-xs text-gray-600 mb-2">
                        Required: <span className="font-semibold">{minPercentage}%</span> attendance
                    </div>
                )}
                <div className="flex flex-col space-y-3 min-[360px]:space-y-4">
                    <div className={`flex flex-col min-[360px]:flex-row justify-center items-center gap-3 min-[360px]:gap-6 min-[375px]:gap-10 ${!showAllDetails && 'mt-1'}`}>
                        <div className="text-center">
                            <span className="text-xs min-[360px]:text-sm font-medium text-gray-600 block">Safe Classes to Miss:</span>
                            <span className={`text-xl min-[360px]:text-2xl font-bold ${getBunkStatusColor()}`}>
                                {safeBunks}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="text-xs min-[360px]:text-sm font-medium text-gray-600 block">Attendance After Bunks:</span>
                            <span className={`text-xl min-[360px]:text-2xl font-bold ${parseFloat(projectedPercentage) >= minPercentage ? "text-green-600" : "text-red-600"}`}>
                                {projectedPercentage}%
                            </span>
                        </div>
                    </div>{safeBunks > 0 && showAllDetails && (
                        <div className="bg-gray-50 rounded-md py-2 px-3 text-center text-xs text-gray-600 border border-gray-200">
                            <span>
                                After using all {safeBunks} safe bunk{safeBunks > 1 ? 's' : ''} {leaveClasses !== 0}: <br />
                                <strong>{presentClasses}</strong> present / <strong>{effectiveFutureTotal}</strong> total classes {leaveClasses !== 0 && (<>(<strong>{totalClasses + safeBunks}</strong> lectures including leaves)</>)}
                            </span>
                        </div>                    
                    )}
                </div>
                  {/* Toggle details button */}
                <button
                    className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bottom-[-45px] bg-secondary hover:bg-secondary/80 transition-colors rounded-full p-1 shadow-md border border-secondary/50"
                    onClick={toggleShowDetails}
                    aria-label={showAllDetails ? "Hide details" : "Show details"}
                >
                    {showAllDetails ? 
                        <ChevronUpIcon className="h-5 w-5 stroke-2 stroke-white text-white" /> : 
                        <ChevronDownIcon className="h-5 w-5 stroke-2 stroke-white text-white" />
                    }
                </button>
            </div>
        </div>
    );
};

export default SafeBunkCalculator;
