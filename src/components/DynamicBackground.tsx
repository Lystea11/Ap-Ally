// src/components/DynamicBackground.tsx

export function DynamicBackground() {
    return (
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-background">
            <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#8080804D_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
            <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_1000px_at_50%_200px,theme(colors.blue.100),transparent)] animate-aurora"></div>
        </div>
    );
}