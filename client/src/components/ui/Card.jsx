export default function Card({ children, className = '', variant = 'default', hover = false }) {
    const variants = {
        default: 'glass',
        gradient: 'gradient-violet-cyan text-white',
        strong: 'glass-strong'
    };

    const hoverClass = hover ? 'hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer' : '';

    return (
        <div className={`${variants[variant]} rounded-2xl p-6 ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}
