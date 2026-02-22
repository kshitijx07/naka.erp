import React from 'react';

const Skeleton = ({ className, width, height, variant = "rect" }) => {
    const baseClasses = "animate-pulse bg-gray-200";
    const variantClasses = {
        circle: "rounded-full",
        rect: "rounded-xl",
        text: "rounded h-4"
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
            style={{ width, height }}
        />
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* Header Skeleton */}
            <Skeleton className="h-[280px] w-full rounded-3xl" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Skeleton */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 h-[450px]">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <Skeleton className="h-full w-full rounded-lg" />
                </div>

                {/* Widgets Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <div className="p-6 space-y-4">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                </div>
            ))}
        </div>
    </div>
);

export const MaintenanceSkeleton = () => (
    <div className="space-y-8 pb-10">
        <Skeleton className="h-[240px] w-full rounded-3xl" />
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
    </div>
);

export const PageSkeleton = ({ type = 'table' }) => (
    <div className="space-y-8 pb-10">
        <Skeleton className="h-[240px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        {type === 'table' ? (
            <TableSkeleton rows={6} />
        ) : (
            <CardGridSkeleton count={6} />
        )}
    </div>
);

export default Skeleton;
