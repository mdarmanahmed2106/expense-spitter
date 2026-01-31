import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950">
            <div className="w-48 h-48 md:w-64 md:h-64">
                <Lottie animationData={loadingAnimation} loop={true} />
            </div>
        </div>
    );
};

export default PageLoader;
