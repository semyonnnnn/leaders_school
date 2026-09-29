import { ErrorTelemetryProps } from "@/types";

const ErrorTelemetry = ({ summary, details, onClear }: ErrorTelemetryProps) => {
    if (!summary) return null;

    return (
        <div id="ErrorTelemetry" className="w-full p-1 bg-zinc-300 border border-zinc-400 rounded-xs shadow-[0_12px_35px_rgba(0,0,0,0.2)] relative font-mono z-50 animate-fade-in">
            {/* Severe System Override Corner Accents */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-600 pointer-events-none"></div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-600 pointer-events-none"></div>

            {/* Main Terminal Console Core */}
            <div className="relative block w-full bg-zinc-950 text-red-500 border border-red-950 p-5 overflow-hidden select-none">

                {/* Advanced CRT Scanline & Grid Layers */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 opacity-[0.12] mix-blend-overlay">
                    <div className="w-full h-0.5 bg-red-500" style={{ animation: 'staticScanline 10s linear infinite' }}></div>
                </div>
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ef4444_1px,transparent_1px),linear-gradient(to_bottom,#ef4444_1px,transparent_1px)] bg-size-[8px_8px] pointer-events-none z-0"></div>

                {/* Header Block */}
                <div className="flex justify-between items-center border-b border-red-900/40 pb-3 mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-xs h-2.5 w-2.5 bg-red-500 shadow-[0_0_10px_#ef4444]"></span>
                        </div>
                        <span className="text-sm font-black uppercase tracking-[0.15em] text-zinc-200">
                            [ ИСКЛЮЧЕНИЕ_БАЗЫ_ДАННЫХ // СБОЙ_ИНДЕКСАЦИИ ]
                        </span>
                    </div>

                    {/* Interoperable Action Element */}
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-[10px] text-zinc-400 font-bold bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 tracking-widest hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 cursor-pointer uppercase"
                    >
                        [ СКРЫТЬ ]
                    </button>
                </div>

                {/* Tactical Asymmetric Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 items-start">

                    {/* Left Panel: Static Telemetry Diagnostics */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-3 text-xs space-y-2 text-zinc-400">
                            <div className="font-black border-b border-zinc-800 pb-1 mb-1.5 text-red-500 uppercase tracking-widest">// ОТЧЁТ_СБОЯ</div>
                            <div className="flex justify-between"><span>ОПЕРАЦИЯ:</span> <span className="font-bold text-zinc-100">BATCH_INJECT</span></div>
                            <div className="flex justify-between"><span>КОНФЛИКТЫ:</span> <span className="font-bold text-red-400">{details ? details.length : "0"} UNITS</span></div>
                            <div className="flex justify-between"><span>КЛАСС_ОШИБКИ:</span> <span className="font-bold text-red-400">SYS_409_DUPLICATE</span></div>
                        </div>
                        <div className="text-xs text-red-600 font-bold tracking-widest animate-pulse leading-none pl-1">
                            &gt;&gt; ИЗОЛИРОВАНО_ДЛЯ_АНАЛИЗА
                        </div>
                    </div>

                    {/* Right Panel: Active Telemetry Streams */}
                    <div className="md:col-span-2 space-y-3.5">

                        {/* High Visibility Error Banner */}
                        <div className="bg-red-950/20 border-l-2 border-red-600 p-3 text-sm font-bold uppercase tracking-wide text-red-200 flex items-start gap-3">
                            <span className="text-red-500 font-black text-base select-none leading-none mt-0.5">!</span>
                            <div className="leading-tight">{summary}</div>
                        </div>

                        {/* Telemetry Output Box */}
                        {details && details.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                                    // ПАКЕТ_ТЕЛЕМЕТРИИ_ОТКЛОНЕНИЙ:
                                </label>
                                <div className="max-h-36 overflow-y-auto bg-black/40 border border-zinc-900 p-3 text-xs font-mono text-zinc-300 space-y-1.5 custom-scrollbar scrollbar-thin scrollbar-thumb-red-950 scrollbar-track-transparent">
                                    {details.map((log, index) => (
                                        <div key={index} className="flex gap-2.5 hover:bg-red-950/20 px-1 py-0.5 rounded-2xs transition-colors duration-150">
                                            <span className="text-red-700 font-black select-none">[{String(index + 1).padStart(2, '0')}]</span>
                                            <span className="tracking-wide font-medium text-zinc-300">{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-zinc-900 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    <span>STATUS // SECURITY_CORE_ISOLATION_ACTIVE</span>
                    <span className="font-mono text-zinc-500">SYS_LOC // ERR_LOG_NODE</span>
                </div>
            </div>
        </div>
    );
};

export { ErrorTelemetry };