interface TestTabHeaderProps {
    title: string;
    count: number;
    countLabel: string;
    description: string;
    accentColor: string;
}
export default function TestTabHeader({
    title,
    count,
    countLabel,
    description,
    accentColor,
}: TestTabHeaderProps) {
    return (
        <div className="relative border-l-8 border-zinc-950 py-1 pl-5">
            {' '}
            <div
                className={`absolute top-0 left-0 h-2 w-3 ${accentColor} -ml-2`}
            ></div>{' '}
            <div className="mb-2 flex items-center gap-3">
                {' '}
                <h1 className="text-2xl font-black tracking-wide text-zinc-900 uppercase md:text-3xl">
                    {' '}
                    {title}{' '}
                </h1>{' '}
                <span className="clip-corner border-2 border-zinc-400 bg-zinc-200 px-2 py-1 text-lg font-black tracking-wider text-nowrap text-zinc-700">
                    {' '}
                    [{count} {countLabel}]{' '}
                </span>{' '}
            </div>{' '}
            <p className="text-xs font-bold tracking-wider text-zinc-600 uppercase md:text-sm">
                {' '}
                // {description}{' '}
            </p>{' '}
        </div>
    );
}
