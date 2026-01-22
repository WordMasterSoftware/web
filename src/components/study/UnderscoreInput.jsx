import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * 下划线样式的单词输入组件
 * 根据单词长度生成对应数量的下划线
 */
const UnderscoreInput = ({
  wordLength = 0,
  value = '',
  onChange,
  onSubmit,
  disabled = false,
  isCorrect = null,
  className = '',
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // 初始化refs数组
    inputRefs.current = inputRefs.current.slice(0, wordLength);
  }, [wordLength]);

  // 当value变化时，更新焦点位置
  useEffect(() => {
    if (value.length < wordLength) {
      setFocusedIndex(value.length);
      inputRefs.current[value.length]?.focus();
    }
  }, [value, wordLength]);

  const handleInputChange = (index, char) => {
    if (disabled) return;

    // 只允许输入字母
    if (char && !/^[a-zA-Z]$/.test(char)) return;

    const newValue = value.split('');
    newValue[index] = char.toLowerCase();
    const result = newValue.join('').substring(0, wordLength);

    onChange(result);

    // 如果输入了字符且不是最后一个，自动跳到下一个
    if (char && index < wordLength - 1) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    // 退格键
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (value[index]) {
        // 如果当前位置有字符，删除当前字符
        handleInputChange(index, '');
      } else if (index > 0) {
        // 如果当前位置无字符，删除前一个字符并移动焦点
        handleInputChange(index - 1, '');
        setFocusedIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
    // 左箭头
    else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    // 右箭头
    else if (e.key === 'ArrowRight' && index < wordLength - 1) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
    // 回车键
    else if (e.key === 'Enter' && value.length === wordLength) {
      onSubmit?.();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData('text').toLowerCase();
    const letters = pastedText.replace(/[^a-z]/g, '');
    const result = letters.substring(0, wordLength);

    onChange(result);

  };

  return (
    <div className={cn('flex justify-center items-center gap-2 md:gap-3', className)}>
      {Array.from({ length: wordLength }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            className={cn(
              'w-10 h-14 md:w-12 md:h-16 text-center text-2xl md:text-3xl font-bold',
              'bg-transparent border-b-4 outline-none transition-all duration-200',
              'text-gray-900 dark:text-white',
              'focus:scale-110',
              // 默认状态
              !isCorrect && 'border-gray-300 dark:border-gray-600',
              // 聚焦状态
              !isCorrect && focusedIndex === index && 'border-primary-500 dark:border-primary-400',
              // 正确状态
              isCorrect === true && 'border-success-500 dark:border-success-400',
              // 错误状态
              isCorrect === false && 'border-error-500 dark:border-error-400',
              // 禁用状态
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              caretColor: 'transparent', // 隐藏光标
            }}
          />
          {/* 自定义光标 */}
          {focusedIndex === index && !value[index] && !disabled && (
            <motion.div
              className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-primary-500"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default UnderscoreInput;
