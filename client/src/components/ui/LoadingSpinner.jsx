import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading.json';

export default function LoadingSpinner({ size = 'md' }) {
    const sizes = {
        sm: 'h-10 w-10',
        md: 'h-20 w-20',
        lg: 'h-32 w-32'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} flex items-center justify-center`}>
                <Lottie animationData={loadingAnimation} loop={true} />
            </div>
        </div>
    );
}
