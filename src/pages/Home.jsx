import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import { useConfigStore } from '@/stores';
import TextPressure from '@/components/reactbits/TextPressure';
import ColorBends from '@/components/reactbits/ColorBends';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import SplitText from '@/components/reactbits/SplitText';
/**
 * 首页 - 系统介绍
 */
const Home = () => {
  const { isConfigured } = useConfigStore();

  const features = [
    {
      name: 'AI智能翻译',
      description: '基于大模型的智能单词翻译，自动生成例句和音标',
      icon: SparklesIcon,
    },
    {
      name: '科学记忆曲线',
      description: '根据艾宾浩斯遗忘曲线，智能安排复习时间',
      icon: AcademicCapIcon,
    },
    {
      name: '多模式学习',
      description: '新词背诵、即时复习、随机复习、完全复习四种模式',
      icon: BookOpenIcon,
    },
    {
      name: '数据可视化',
      description: '学习进度、复习曲线一目了然，激励持续学习',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* 1. Full Screen Hero Section with ColorBends Background */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        {/* Background Effect - Only for this section */}
        <div className="absolute inset-0 z-0 opacity-60">
          <ColorBends
            colors={["#ff5c7a", "#ffae00", "#fffc5c", "#00ccff", "#0051ff"]}
            rotation={-6}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.1}
            transparent
            autoRotate={0}
            color=""
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ position: 'relative', height: '200px' }} className="mb-8">
              <TextPressure
                text="Word Master"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#5227FF"
                minFontSize={48}
              />
            </div>

            <p className="text-xl md:text-3xl text-white/90 font-light mb-12 max-w-2xl mx-auto">
              AI驱动的智能背单词系统
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to={isConfigured ? '/user/register' : '/url-config'}>
                <Button
                  size="xl"
                  variant={null}
                  className="group relative px-12 py-4 text-lg bg-white text-black border-none !rounded-full shadow-2xl overflow-hidden transition-all hover:scale-105 hover:bg-white"
                >
                  <span className="relative z-10 font-bold">{isConfigured ? '立即注册' : '开始使用'}</span>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-gray-300/50 to-transparent -skew-x-12 transition-all duration-1000 ease-in-out group-hover:left-full" />
                </Button>
              </Link>
              <Link to="/user/login">
                <Button size="xl" variant="outline" className="px-12 py-4 text-lg border-white text-white hover:bg-white/10 !rounded-full transition-all hover:scale-105">
                  登录账号
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* 2. Introduction Section (Black Background) */}
      <div className="relative z-10 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

          {/* Features */}
          <div className="mb-16 text-center">
              <SplitText
                text="核 心 功 能"
                className="text-3xl font-bold text-center bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 inline-block"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
              />
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {features.map((feature) => (
              <SpotlightCard
                key={feature.name}
                className="custom-spotlight-card group"
                spotlightColor="rgba(0, 102, 255, 0.81)"
              >
                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-gray-400 group-hover:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </SpotlightCard>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div
            className="mt-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            
              
          <div className="mb-16 text-center">
              <SplitText
                text="三步开启学习"
                className="text-3xl font-bold text-center bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 inline-block"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
              />
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: '配置后端',
                  description: '输入后端API地址，测试连接',
                },
                {
                  step: '02',
                  title: '导入单词',
                  description: '创建单词本，批量导入单词',
                },
                {
                  step: '03',
                  title: '开始学习',
                  description: '选择学习模式，开始背单词',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <div className="text-center">
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 mb-6 select-none">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-32 pt-8 border-t border-zinc-900 flex flex-col items-center justify-center space-y-4 text-center text-gray-600 text-sm">
            <p>WordMaster v1.2.0 - 开源背单词系统</p>
            <a
              href="https://github.com/WordMasterSoftware"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>WordMasterSoftware</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
