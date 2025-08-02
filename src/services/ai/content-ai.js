// src/services/ai/content-ai.js
// خدمة تحليل المحتوى بالذكاء الاصطناعي للغة العربية والإنجليزية

// قاموس المصطلحات السياسية للتصنيف
const POLITICAL_TERMS = {
  'السياسة الدولية': [
    'دبلوماسية', 'علاقات دولية', 'معاهدات', 'اتفاقيات', 'دول', 'حكومات',
    'منظمات دولية', 'الأمم المتحدة', 'أمن دولي', 'سياسة خارجية'
  ],
  'السياسة المحلية': [
    'حكومة', 'انتخابات', 'أحزاب', 'قوانين', 'تشريع', 'برلمان', 'مجلس',
    'وزارة', 'محافظة', 'بلدية', 'إدارة محلية', 'خدمات عامة'
  ],
  'الاقتصاد السياسي': [
    'اقتصاد', 'استثمار', 'تجارة', 'تنمية', 'ميزانية', 'ضرائب', 'بنوك',
    'مالية عامة', 'نمو اقتصادي', 'سياسة اقتصادية', 'تخطيط'
  ],
  'الأمن والدفاع': [
    'أمن قومي', 'دفاع', 'استراتيجية عسكرية', 'قوات مسلحة', 'أمن داخلي',
    'مكافحة إرهاب', 'حروب', 'صراعات', 'سلام', 'أمن إقليمي'
  ],
  'حقوق الإنسان': [
    'حريات', 'ديمقراطية', 'عدالة', 'مساواة', 'حقوق مدنية', 'حقوق سياسية',
    'حكم القانون', 'شفافية', 'مساءلة', 'مجتمع مدني'
  ]
};

// قاموس كلمات المشاعر
const SENTIMENT_WORDS = {
  positive: [
    'ممتاز', 'رائع', 'جيد', 'إيجابي', 'تقدم', 'نجاح', 'تطوير', 'تحسن',
    'excellent', 'great', 'good', 'positive', 'progress', 'success', 'development'
  ],
  negative: [
    'سيء', 'فشل', 'مشكلة', 'أزمة', 'تراجع', 'سلبي', 'خطر', 'صعوبة',
    'bad', 'failure', 'problem', 'crisis', 'decline', 'negative', 'danger'
  ],
  neutral: [
    'تحليل', 'دراسة', 'بحث', 'معلومات', 'بيانات', 'تقرير', 'عرض',
    'analysis', 'study', 'research', 'information', 'data', 'report'
  ]
};

// فئة خدمة تحليل المحتوى
class ContentAnalysisService {
  constructor() {
    this.cache = new Map();
    this.analysisHistory = [];
  }

  /**
   * تحليل شامل للمحتوى
   */
  async analyzeContent(content, options = {}) {
    const {
      includeTopicClassification = true,
      includeSentimentAnalysis = true,
      includeQualityMetrics = true,
      includeKeywords = true,
      includeReadability = true,
      language = 'auto'
    } = options;

    try {
      const analysisResult = {
        id: Date.now(),
        timestamp: new Date(),
        content: content.substring(0, 200) + '...', // عينة من المحتوى
        language: this.detectLanguage(content),
        analysis: {}
      };

      // تصنيف الموضوع
      if (includeTopicClassification) {
        analysisResult.analysis.topicClassification = this.classifyTopic(content);
      }

      // تحليل المشاعر
      if (includeSentimentAnalysis) {
        analysisResult.analysis.sentiment = this.analyzeSentiment(content);
      }

      // مقاييس الجودة
      if (includeQualityMetrics) {
        analysisResult.analysis.quality = this.analyzeQuality(content);
      }

      // استخراج الكلمات المفتاحية
      if (includeKeywords) {
        analysisResult.analysis.keywords = this.extractKeywords(content);
      }

      // تحليل سهولة القراءة
      if (includeReadability) {
        analysisResult.analysis.readability = this.analyzeReadability(content);
      }

      // حفظ في السجل
      this.analysisHistory.push(analysisResult);
      if (this.analysisHistory.length > 100) {
        this.analysisHistory.shift(); // الاحتفاظ بآخر 100 تحليل
      }

      return analysisResult;
    } catch (error) {
      console.error('خطأ في تحليل المحتوى:', error);
      throw new Error('فشل في تحليل المحتوى');
    }
  }

  /**
   * كشف لغة النص
   */
  detectLanguage(text) {
    const arabicPattern = /[\u0600-\u06FF]/g;
    const arabicMatches = text.match(arabicPattern);
    const arabicRatio = arabicMatches ? arabicMatches.length / text.length : 0;

    if (arabicRatio > 0.3) {
      return arabicRatio > 0.7 ? 'ar' : 'mixed';
    }
    return 'en';
  }

  /**
   * تصنيف الموضوع
   */
  classifyTopic(content) {
    const text = content.toLowerCase();
    const scores = {};

    Object.keys(POLITICAL_TERMS).forEach(topic => {
      scores[topic] = 0;
      POLITICAL_TERMS[topic].forEach(term => {
        const termOccurrences = (text.match(new RegExp(term, 'g')) || []).length;
        scores[topic] += termOccurrences;
      });
    });

    // ترتيب النتائج
    const sortedTopics = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, score]) => ({
        topic,
        score,
        confidence: Math.min(score * 10, 100) // تحويل لنسبة مئوية
      }));

    return {
      primaryTopic: sortedTopics[0] || { topic: 'عام', score: 0, confidence: 0 },
      allTopics: sortedTopics,
      classification: sortedTopics[0]?.confidence > 30 ? 'specific' : 'general'
    };
  }

  /**
   * تحليل المشاعر
   */
  analyzeSentiment(content) {
    const text = content.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // حساب نقاط المشاعر
    SENTIMENT_WORDS.positive.forEach(word => {
      positiveScore += (text.match(new RegExp(word, 'g')) || []).length;
    });

    SENTIMENT_WORDS.negative.forEach(word => {
      negativeScore += (text.match(new RegExp(word, 'g')) || []).length;
    });

    SENTIMENT_WORDS.neutral.forEach(word => {
      neutralScore += (text.match(new RegExp(word, 'g')) || []).length;
    });

    const totalScore = positiveScore + negativeScore + neutralScore;
    
    let sentiment = 'neutral';
    let confidence = 0;

    if (totalScore > 0) {
      const positiveRatio = positiveScore / totalScore;
      const negativeRatio = negativeScore / totalScore;

      if (positiveRatio > 0.4) {
        sentiment = 'positive';
        confidence = Math.min(positiveRatio * 100, 95);
      } else if (negativeRatio > 0.4) {
        sentiment = 'negative';
        confidence = Math.min(negativeRatio * 100, 95);
      } else {
        confidence = Math.max(neutralScore / totalScore * 100, 20);
      }
    }

    return {
      sentiment,
      confidence: Math.round(confidence),
      scores: {
        positive: positiveScore,
        negative: negativeScore,
        neutral: neutralScore
      },
      analysis: this.getSentimentDescription(sentiment, confidence)
    };
  }

  /**
   * تحليل جودة المحتوى
   */
  analyzeQuality(content) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // مقاييس أساسية
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgSentencesPerParagraph = paragraphCount > 0 ? sentenceCount / paragraphCount : 0;

    // تنوع المفردات
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const vocabularyDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

    // تقييم الطول
    let lengthScore = 0;
    if (wordCount >= 300 && wordCount <= 1500) lengthScore = 1;
    else if (wordCount >= 150 && wordCount <= 2000) lengthScore = 0.8;
    else if (wordCount >= 50) lengthScore = 0.6;

    // تقييم التنوع
    let diversityScore = 0;
    if (vocabularyDiversity >= 0.7) diversityScore = 1;
    else if (vocabularyDiversity >= 0.5) diversityScore = 0.8;
    else if (vocabularyDiversity >= 0.3) diversityScore = 0.6;

    // تقييم التنظيم
    let structureScore = 0;
    if (paragraphCount >= 3 && avgSentencesPerParagraph >= 2 && avgSentencesPerParagraph <= 6) {
      structureScore = 1;
    } else if (paragraphCount >= 2 && avgSentencesPerParagraph >= 1) {
      structureScore = 0.7;
    } else if (sentenceCount >= 3) {
      structureScore = 0.5;
    }

    // النتيجة الإجمالية
    const overallScore = (lengthScore + diversityScore + structureScore) / 3;

    return {
      overallScore: Math.round(overallScore * 100),
      metrics: {
        wordCount,
        sentenceCount,
        paragraphCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        vocabularyDiversity: Math.round(vocabularyDiversity * 100)
      },
      scores: {
        length: Math.round(lengthScore * 100),
        diversity: Math.round(diversityScore * 100),
        structure: Math.round(structureScore * 100)
      },
      grade: this.getQualityGrade(overallScore),
      recommendations: this.getQualityRecommendations(lengthScore, diversityScore, structureScore)
    };
  }

  /**
   * استخراج الكلمات المفتاحية
   */
  extractKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // إزالة كلمات الربط الشائعة
    const stopWords = new Set([
      'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'which', 'that', 'this', 'these',
      'على', 'في', 'من', 'إلى', 'عن', 'مع', 'بعد', 'قبل', 'and', 'or', 'but', 'in', 'on', 'at'
    ]);

    const filteredWords = words.filter(word => !stopWords.has(word));

    // حساب تكرار الكلمات
    const wordFreq = {};
    filteredWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // ترتيب حسب التكرار
    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, frequency]) => ({
        word,
        frequency,
        relevance: Math.min(frequency * 10, 100)
      }));

    return {
      keywords,
      totalUniqueWords: Object.keys(wordFreq).length,
      density: keywords.length > 0 ? keywords[0].frequency / filteredWords.length : 0
    };
  }

  /**
   * تحليل سهولة القراءة
   */
  analyzeReadability(content) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgCharsPerWord = words.length > 0 ? 
      words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;

    // حساب مستوى الصعوبة
    let difficultyScore = 0;
    
    // طول الجمل
    if (avgWordsPerSentence <= 15) difficultyScore += 25;
    else if (avgWordsPerSentence <= 20) difficultyScore += 15;
    else if (avgWordsPerSentence <= 25) difficultyScore += 5;

    // طول الكلمات
    if (avgCharsPerWord <= 5) difficultyScore += 25;
    else if (avgCharsPerWord <= 7) difficultyScore += 15;
    else if (avgCharsPerWord <= 9) difficultyScore += 5;

    // التنظيم
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 2) difficultyScore += 25;
    else if (sentences.length >= 3) difficultyScore += 15;

    // وضوح المصطلحات
    const technicalTerms = this.countTechnicalTerms(content);
    if (technicalTerms <= 5) difficultyScore += 25;
    else if (technicalTerms <= 10) difficultyScore += 15;
    else if (technicalTerms <= 15) difficultyScore += 5;

    return {
      readabilityScore: Math.min(difficultyScore, 100),
      level: this.getReadabilityLevel(difficultyScore),
      metrics: {
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
        technicalTerms,
        paragraphCount: paragraphs.length
      },
      recommendations: this.getReadabilityRecommendations(difficultyScore)
    };
  }

  /**
   * عد المصطلحات التقنية
   */
  countTechnicalTerms(content) {
    const allTerms = Object.values(POLITICAL_TERMS).flat();
    const text = content.toLowerCase();
    return allTerms.reduce((count, term) => {
      return count + (text.match(new RegExp(term, 'g')) || []).length;
    }, 0);
  }

  /**
   * وصف المشاعر
   */
  getSentimentDescription(sentiment, confidence) {
    switch (sentiment) {
      case 'positive':
        return confidence > 70 ? 'محتوى إيجابي بقوة' : 'محتوى إيجابي معتدل';
      case 'negative':
        return confidence > 70 ? 'محتوى سلبي بقوة' : 'محتوى سلبي معتدل';
      default:
        return 'محتوى محايد وموضوعي';
    }
  }

  /**
   * تقدير جودة المحتوى
   */
  getQualityGrade(score) {
    if (score >= 0.8) return 'ممتاز';
    if (score >= 0.7) return 'جيد جداً';
    if (score >= 0.6) return 'جيد';
    if (score >= 0.5) return 'مقبول';
    return 'يحتاج تحسين';
  }

  /**
   * توصيات تحسين الجودة
   */
  getQualityRecommendations(lengthScore, diversityScore, structureScore) {
    const recommendations = [];

    if (lengthScore < 0.7) {
      recommendations.push('أضف محتوى أكثر تفصيلاً أو اختصر المحتوى المفرط');
    }
    if (diversityScore < 0.7) {
      recommendations.push('استخدم مفردات أكثر تنوعاً وتجنب التكرار');
    }
    if (structureScore < 0.7) {
      recommendations.push('حسن تنظيم المحتوى بفقرات وجمل متوازنة');
    }

    return recommendations;
  }

  /**
   * مستوى سهولة القراءة
   */
  getReadabilityLevel(score) {
    if (score >= 80) return 'سهل جداً';
    if (score >= 60) return 'سهل';
    if (score >= 40) return 'متوسط';
    if (score >= 20) return 'صعب';
    return 'صعب جداً';
  }

  /**
   * توصيات تحسين سهولة القراءة
   */
  getReadabilityRecommendations(score) {
    const recommendations = [];

    if (score < 60) {
      recommendations.push('استخدم جملاً أقصر وأوضح');
      recommendations.push('قلل من استخدام المصطلحات التقنية');
      recommendations.push('اقسم النص إلى فقرات أصغر');
    }

    return recommendations;
  }

  /**
   * احصائيات المحتوى المحلل
   */
  getAnalyticsOverview() {
    const recentAnalyses = this.analysisHistory.slice(-10);
    
    if (recentAnalyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageQuality: 0,
        popularTopics: [],
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
      };
    }

    // متوسط الجودة
    const avgQuality = recentAnalyses.reduce((sum, analysis) => {
      return sum + (analysis.analysis.quality?.overallScore || 0);
    }, 0) / recentAnalyses.length;

    // المواضيع الشائعة
    const topicCounts = {};
    recentAnalyses.forEach(analysis => {
      const topic = analysis.analysis.topicClassification?.primaryTopic?.topic;
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

    const popularTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ 
        name: topic, 
        count,
        percentage: Math.round((count / recentAnalyses.length) * 100)
      }));

    // توزيع المشاعر
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    recentAnalyses.forEach(analysis => {
      const sentiment = analysis.analysis.sentiment?.sentiment || 'neutral';
      sentimentCounts[sentiment]++;
    });

    return {
      totalAnalyses: this.analysisHistory.length,
      recentAnalyses: recentAnalyses.length,
      averageQuality: Math.round(avgQuality),
      popularTopics,
      sentimentDistribution: {
        positive: Math.round((sentimentCounts.positive / recentAnalyses.length) * 100),
        negative: Math.round((sentimentCounts.negative / recentAnalyses.length) * 100),
        neutral: Math.round((sentimentCounts.neutral / recentAnalyses.length) * 100)
      }
    };
  }
}

// إنشاء مثيل الخدمة
const contentAnalysisService = new ContentAnalysisService();

// Hook للاستخدام في مكونات React
export const useContentAnalysis = () => {
  const analyzeContent = async (content, options) => {
    return await contentAnalysisService.analyzeContent(content, options);
  };

  const getAnalytics = () => {
    return contentAnalysisService.getAnalyticsOverview();
  };

  return {
    analyzeContent,
    getAnalytics,
    contentInsights: contentAnalysisService.getAnalyticsOverview()
  };
};

export default contentAnalysisService;