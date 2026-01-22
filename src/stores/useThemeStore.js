import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 主题状态管理
 * 支持 light/dark/system 三种模式
 * 持久化到 localStorage
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      // 状态
      theme: 'system', // 'light' | 'dark' | 'system'
      actualTheme: 'light', // 实际应用的主题

      // Actions
      /**
       * 设置主题模式
       * @param {string} theme - 'light' | 'dark' | 'system'
       */
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      /**
       * 应用主题到 DOM（带动画）
       * @param {string} theme - 主题模式
       * @param {Object} clickPosition - 点击位置 { x, y }
       */
      applyTheme: (theme, clickPosition = null) => {
        const root = document.documentElement;

        // 确定目标主题
        let targetTheme;
        if (theme === 'dark') {
          targetTheme = 'dark';
        } else if (theme === 'light') {
          targetTheme = 'light';
        } else {
          // system - 检测系统偏好
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          targetTheme = isDark ? 'dark' : 'light';
        }

        // 如果有点击位置且浏览器支持 View Transition，执行圆形扩散动画
        if (clickPosition && document.startViewTransition) {
          // 1. 注入临时样式：禁用默认动画，控制层级
          const style = document.createElement('style');
          style.innerHTML = `
            ::view-transition-old(root),
            ::view-transition-new(root) {
              animation: none; /* 禁用默认的淡入淡出 */
              mix-blend-mode: normal;
              height: 100%;
              overflow: clip;
            }
            /* 新视图在顶层 */
            ::view-transition-new(root) {
              z-index: 2147483646;
            }
            /* 旧视图在底层，保持不动 */
            ::view-transition-old(root) {
              z-index: 1;
            }
          `;
          document.head.appendChild(style);

          // 2. 开始过渡
          const transition = document.startViewTransition(() => {
            // 在这里真正切换 DOM 类名，浏览器会捕获前后两个快照
            if (targetTheme === 'dark') {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
            set({ actualTheme: targetTheme });
          });

          // 3. 准备自定义动画
          transition.ready.then(() => {
            const { x, y } = clickPosition;
            // 计算扩散半径：到屏幕最远角的距离
            const endRadius = Math.hypot(
              Math.max(x, window.innerWidth - x),
              Math.max(y, window.innerHeight - y)
            );

            // 4. 对新视图应用 clip-path 动画
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 500,
                easing: 'ease-in-out',
                // 指定只作用于新视图的伪元素
                pseudoElement: '::view-transition-new(root)',
              }
            );
          });

          // 5. 动画结束后清理样式
          transition.finished.finally(() => {
            style.remove();
          });
        } else {
          // 降级方案：直接切换
          if (targetTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          set({ actualTheme: targetTheme });
        }
      },

      /**
       * 初始化主题（应用启动时调用）
       */
      initTheme: () => {
        const { theme, applyTheme } = get();
        applyTheme(theme);

        // 监听系统主题变化
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (get().theme === 'system') {
              applyTheme('system');
            }
          });
      },

      /**
       * 切换主题（在 light 和 dark 之间切换）
       * @param {Object} clickPosition - 可选的点击位置 { x, y }
       */
      toggleTheme: (clickPosition = null) => {
        const { actualTheme } = get();
        const newTheme = actualTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        get().applyTheme(newTheme, clickPosition);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
