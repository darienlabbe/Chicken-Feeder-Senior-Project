import React from "react";

function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 border-[10px] border-t-red-500 border-solid rounded-full animate-spin"/>
                <p className="text-3xl font-semibold text-white">Loading...</p>
            </div>
        </div>
    );
}

export default Loading;