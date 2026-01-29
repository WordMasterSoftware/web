import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { examApi } from '@/api/exam';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { PageLoading } from '@/components/common/Loading';
import useTimer from '@/hooks/useTimer';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);

  // Form State
  const [spellingAnswers, setSpellingAnswers] = useState({}); // { word_id: user_input }
  const [translationAnswers, setTranslationAnswers] = useState({}); // { sentence_id: user_input }

  // Validation State (for immediate feedback if needed, or final check)
  const [spellingValidation, setSpellingValidation] = useState({}); // { word_id: boolean }

  // Forward declaration for useTimer callback
  // Use a ref to access the latest submit function without recreating the timer hook
  const handleSubmitRef = useRef(null);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });


  const onTimerExpire = () => {
    if (!submitting && !isResultModalOpen) {
      toast('考试时间到，自动提交中...', { icon: <ClockIcon className="w-5 h-5 text-red-500" /> });
      if (handleSubmitRef.current) {
        handleSubmitRef.current(true);
      }
    }
  };

  const { timeLeft, formattedTime, stop: stopTimer } = useTimer(exam?.estimated_duration_minutes, onTimerExpire);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await examApi.getDetail(examId);
        setExam(res);
      } catch (error) {
        toast.error('加载试卷失败');
        console.error(error);
        navigate('/study/review');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  const handleSpellingChange = (wordId, value) => {
    setSpellingAnswers(prev => ({
      ...prev,
      [wordId]: value
    }));

    // Clear validation status when typing
    if (spellingValidation[wordId] !== undefined) {
      setSpellingValidation(prev => {
        const next = { ...prev };
        delete next[wordId];
        return next;
      });
    }
  };

  const handleTranslationChange = (sentenceId, value) => {
    setTranslationAnswers(prev => ({
      ...prev,
      [sentenceId]: value
    }));
  };

  const handleSubmit = async (isForce = false) => {
    if (!exam || submitting) return;

    const forceSubmit = isForce === true;

    // 1. Client-side Validation for Spelling
    const wrongWords = [];
    const newSpellingValidation = {};
    let hasEmptyFields = false;

    // Check Spelling
    exam.spelling_section.forEach(q => {
      const input = (spellingAnswers[q.word_id] || '').trim().toLowerCase();
      const answer = (q.english_answer || '').trim().toLowerCase();

      if (!input) hasEmptyFields = true;

      const isCorrect = input === answer;
      newSpellingValidation[q.word_id] = isCorrect;

      if (!isCorrect) {
        wrongWords.push(q.item_id || q.word_id);
      }
    });

    // Check Translation (just empty check)
    exam.translation_section.forEach(q => {
      if (!translationAnswers[q.sentence_id]?.trim()) {
        hasEmptyFields = true;
      }
    });

    if (hasEmptyFields && !forceSubmit) {
      toast('请完成所有题目后再提交', { icon: <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" /> });
      return;
    }

    setSpellingValidation(newSpellingValidation);

    // 2. Prepare Payload
    const sentencesPayload = exam.translation_section.map(q => ({
      sentence_id: q.sentence_id,
      chinese: q.chinese,
      english: translationAnswers[q.sentence_id] || '',
      words_involved: q.words_involved
    }));

    // 3. Submit
    try {
      setSubmitting(true);
      const res = await examApi.submit({
        exam_id: exam.exam_id,
        collection_id: exam.collection_id,
        wrong_words: wrongWords,
        sentences: sentencesPayload
      });

      if (res.success) {
        setIsResultModalOpen(true);
      } else {
        toast.error(res.message || '提交失败');
      }
    } catch (error) {
      console.error(error);
      toast.error('提交出错，请重试');
    } finally {
      setSubmitting(false);
    }
  };


  // Prevent immediate navigation after submission
  useEffect(() => {
    if (isResultModalOpen) {
      setCanNavigate(false);
      const timer = setTimeout(() => {
        setCanNavigate(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isResultModalOpen]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <PageLoading />;
  if (!exam) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 dark:bg-dark-bg z-10 py-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {exam.collection_name} - 复习测试
            </h1>
            <p className="text-sm text-gray-500">
              {exam.spelling_section?.length || 0} 个单词 · {exam.translation_section?.length || 0} 个例句 · 考试限时 {exam.estimated_duration_minutes} 分钟
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`hidden md:flex items-center px-4 py-2 rounded-lg border transition-colors ${
              timeLeft < 60
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-white border-gray-200 text-gray-700 dark:bg-dark-card dark:border-gray-700 dark:text-gray-300'
            }`}>
              <ClockIcon className="w-5 h-5 mr-2" />
              <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="shadow-lg"
          >
            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">提交试卷</span>
            <span className="md:hidden">提交</span>
          </Button>
        </div>
      </div>

      {/* Part 1: Spelling */}
      <section>
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">1</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">单词默写</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {exam.spelling_section.map((q, idx) => (
            <Card key={q.word_id} className={`p-4 border transition-colors ${
              spellingValidation[q.word_id] === false
                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                : spellingValidation[q.word_id] === true
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                  : 'border-transparent'
            }`}>
              <div className="mb-2 text-sm text-gray-500 font-medium">Question {idx + 1}</div>
              <div className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
                {q.chinese}
              </div>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="输入英文单词..."
                  value={spellingAnswers[q.word_id] || ''}
                  onChange={(e) => handleSpellingChange(q.word_id, e.target.value)}
                />
                {spellingValidation[q.word_id] === false && (
                  <XCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
                {spellingValidation[q.word_id] === true && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Part 2: Translation */}
      <section className="pt-8 border-t border-gray-200 dark:border-dark-border">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-3">2</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">句子翻译</h2>
        </div>

        <div className="space-y-6">
          {exam.translation_section.map((q, idx) => (
            <Card key={q.sentence_id} className="p-6">
              <div className="mb-2 text-sm text-gray-500 font-medium">Question {idx + 1}</div>
              <div className="mb-4 text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                {q.chinese}
              </div>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all min-h-[100px] resize-y"
                placeholder="请输入英文翻译..."
                value={translationAnswers[q.sentence_id] || ''}
                onChange={(e) => handleTranslationChange(q.sentence_id, e.target.value)}
              />
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom Action */}
      <div className="flex justify-center pt-8 pb-16">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={submitting}
          className="w-full md:w-auto md:min-w-[200px] shadow-xl"
        >
          提交试卷
        </Button>
      </div>

      {/* Submission Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => navigate('/study/review')}
        title="试卷已提交"
        size="md"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              提交成功！
            </h3>
            <p className="text-gray-500 dark:text-gray-400 px-4">
              系统正在通过 AI 批改您的翻译题目并生成评估报告。
              处理完成后，您将在 <Link to="/messages" className="text-primary-600 hover:underline font-medium">消息中心</Link> 收到详细的结果反馈。
            </p>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <Button
              variant="primary"
              fullWidth
              disabled={!canNavigate}
              onClick={() => navigate(-1)}
            >
              {!canNavigate ? '正在处理中...' : '返回复习列表'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              disabled={!canNavigate}
              onClick={() => navigate('/messages')}
            >
              前往消息中心
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Exam;
