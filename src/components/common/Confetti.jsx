import { useEffect, useState } from 'react';

/**
 * 简单的 CSS 礼花组件
 * 逻辑：使用 useEffect 在挂载时生成一次性随机数据，避免渲染期间调用 Math.random
 */
const Confetti = () => {
  const [particles, setParticles] = useState([]);
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const particleCount = 50;
    const newParticles = [];

    // 在 Effect 中生成随机数据，保证纯净渲染
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 3 + Math.random() * 2,
        delay: Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        isCircle: Math.random() > 0.5,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-3 h-3 opacity-80"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '0',
            transform: `rotate(${p.rotation}deg)`,
            animation: `fall ${p.animationDuration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
