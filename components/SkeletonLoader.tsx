import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center overflow-y-auto bg-[#0e0d0c] min-h-screen">
            {/* Header Skeleton */}
            <div className="px-4 py-3 pt-20 border-b border-[#2c1a12] flex items-center justify-between bg-[#0e0d0c]/98 backdrop-blur-xl z-50 w-full max-w-2xl">
                <div className="h-16 w-32 bg-[#1a1817] rounded-lg animate-pulse" />
                <div className="h-6 w-24 bg-[#1a1817] rounded-full animate-pulse" />
            </div>

            <div className="w-full max-w-2xl px-4 pt-4 space-y-8 pb-32">
                {/* Brew of the Day Skeleton */}
                <div className="w-full h-64 bg-[#1a1817] rounded-[2.5rem] animate-pulse border border-[#2c1a12]"></div>

                {/* Post Skeletons */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-[#2c1a12] p-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-[#1a1817] rounded-full animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 bg-[#1a1817] rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-[#1a1817] rounded animate-pulse" />
                                </div>
                                <div className="h-4 w-full bg-[#1a1817] rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-[#1a1817] rounded animate-pulse" />
                                <div className="h-48 w-full bg-[#1a1817] rounded-xl animate-pulse mt-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
