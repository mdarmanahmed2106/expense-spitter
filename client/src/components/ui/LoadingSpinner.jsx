export default function LoadingSpinner({ size = 'md' }) {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-4 border-accent-violet/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-violet animate-spin"></div>
            </div>
        </div>
    );
}
