import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'react-lottie';
import animationData from '../animation/97474-data-center.json';


function LandingPage() {

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-green-900 mb-8">Welcome to DataChat</h1>
      <p className="text-lg text-gray-700 mb-6">
        Discover the power of data analytics and chat with our experts.
      </p>
      <Link
        to="/datachat"
        className="bg-green-500 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-green-600"
      >
        Start Chatting
      </Link>

      <div style={{ width: '300px', height: '300px', marginTop: '50px' }}>
  <Lottie options={lottieOptions} />
</div>

    </div>
  );
}

export default LandingPage;
