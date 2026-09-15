import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClassroomScene from '../components/3d/ClassroomScene';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <React.Suspense fallback={null}>
          <ClassroomScene />
        </React.Suspense>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto bg-black/10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[var(--color-paper)] p-12 doodle-border paper-card max-w-2xl w-full mx-4 flex flex-col items-center relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(var(--color-paper-line) 1px, transparent 1px), linear-gradient(90deg, transparent 40px, var(--color-margin) 40px, var(--color-margin) 42px, transparent 42px)`,
            backgroundSize: `100% 24px, 100% 100%`
          }}
        >
          {/* Title Section */}
          <div className="text-center mb-10 mt-6 pl-12 relative z-10">
            <h1 className="text-6xl md:text-8xl handwritten-caveat text-[var(--color-ink-blue)] leading-none mb-2" style={{ transform: 'rotate(-2deg)' }}>
              Free Period
            </h1>
            <div className="relative inline-block">
              <h2 className="text-3xl md:text-4xl handwritten text-[var(--color-ink-red)]" style={{ transform: 'rotate(1deg)' }}>
                Hand Cricket 🏏
              </h2>
              {/* Paper underline effect */}
              <svg className="absolute w-full h-4 -bottom-3 left-0" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0,5 Q50,0 100,5" stroke="var(--color-ink-red)" strokeWidth="2" fill="none" style={{ animation: 'scribble 1s forwards' }} />
              </svg>
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="flex flex-col gap-5 w-full max-w-md pl-10 z-10">
            <button 
              onClick={() => navigate('/campaign')}
              className="paper-card doodle-border py-4 px-6 text-2xl handwritten-indie text-left flex items-center justify-between hover:text-[var(--color-ink-red)] group"
            >
              <span>Solo Campaign</span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🏆</span>
            </button>
            
            <button 
              onClick={() => navigate('/lobby?mode=instant')}
              className="paper-card doodle-border py-4 px-6 text-2xl handwritten-indie text-left flex items-center justify-between hover:text-[var(--color-ink-red)] group"
            >
              <span>Instant Match</span>
              <span className="text-3xl group-hover:scale-125 transition-transform">⚡</span>
            </button>

            <button 
              onClick={() => navigate('/lobby?mode=friend')}
              className="paper-card doodle-border py-4 px-6 text-2xl handwritten-indie text-left flex items-center justify-between hover:text-[var(--color-ink-red)] group"
            >
              <span>Play with Friend</span>
              <span className="text-3xl group-hover:scale-125 transition-transform">🤝</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center pl-10 z-10">
            <p className="handwritten-kalam text-lg text-gray-500 opacity-80">
              A Free Period Production
            </p>
          </div>
          
          {/* Decorative Doodles */}
          <div className="absolute top-8 right-8 text-4xl opacity-20 transform rotate-12 pointer-events-none">✏️</div>
          <div className="absolute bottom-12 left-2 text-4xl opacity-20 transform -rotate-12 pointer-events-none">📐</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
