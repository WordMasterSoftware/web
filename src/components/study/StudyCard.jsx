import { motion } from 'framer-motion';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';

/**
 * 3D翻转学习卡片组件
 * 用于显示单词的中文和英文
 */
const StudyCard = ({
  word,
  isFlipped = false,
  isCorrect = null,
  onFlip,
  className = '',
}) => {
  return (
    <div className={cn('relative w-full max-w-xl mx-auto', className)}>
      <motion.div
        className="relative h-72 cursor-pointer perspective-1000"
        onClick={onFlip}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* 正面 - 中文 */}
          <div
            className={cn(
              'absolute w-full h-full backface-hidden',
              'bg-gradient-to-br from-primary-500 to-primary-700',
              'dark:from-primary-600 dark:to-primary-800',
              'rounded-3xl shadow-2xl',
              'flex flex-col items-center justify-center p-8',
              isCorrect === true && 'animate-pulse-success',
              isCorrect === false && 'animate-shake'
            )}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-white/80 text-base mb-3">中文含义</p>
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-3">
                {word?.chinese || '加载中...'}
              </h2>
              {word?.part_of_speech && (
                <p className="text-white/90 text-lg">{word.part_of_speech}</p>
              )}
            </motion.div>

            <div className="absolute bottom-8 text-white/60 text-sm">
              点击卡片翻转查看答案
            </div>
          </div>

          {/* 背面 - 英文 */}
          <div
            className={cn(
              'absolute w-full h-full backface-hidden',
              'rounded-3xl shadow-2xl',
              'flex flex-col items-center justify-center p-8',
              // 正常翻转：绿色背景
              isCorrect !== false && 'bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-800',
              // 错误翻转：红色背景
              isCorrect === false && 'bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800'
            )}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-white/80 text-base mb-3">英文拼写</p>
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-3">
                {word?.word || ''}
              </h2>
              {word?.phonetic && (
                <p className="text-white/90 text-lg mb-4">{word.phonetic}</p>
              )}
              {word?.sentences && word.sentences[0] && (
                <p className="text-white/80 text-base italic max-w-md">
                  "{word.sentences[0]}"
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyCard;
