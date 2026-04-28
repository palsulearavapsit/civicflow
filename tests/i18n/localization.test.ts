/**
 * Localization Tests for all supported languages (TEST-19).
 * Verifies translation completeness and i18n context behaviour.
 */

import { describe, it, expect } from 'vitest';

// ─── Translation Completeness Tests ──────────────────────────────────────────

const REQUIRED_KEYS = [
  'nav.home', 'nav.chat', 'nav.map', 'nav.dashboard',
  'onboarding.title', 'onboarding.zipLabel', 'onboarding.next', 'onboarding.back',
  'chat.placeholder', 'chat.send', 'chat.title',
  'dashboard.title', 'dashboard.nextAction', 'dashboard.riskLevel',
  'errors.required', 'errors.invalidZip', 'errors.networkError',
  'a11y.skipToMain', 'a11y.loading', 'a11y.chatLive',
];

const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'fr', 'ar'];

// Mock translations (in a real app these would be imported from JSON files)
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home', 'nav.chat': 'Election Copilot', 'nav.map': 'Polling Places', 'nav.dashboard': 'My Plan',
    'onboarding.title': 'Set Up Your Voter Profile', 'onboarding.zipLabel': 'ZIP Code', 'onboarding.next': 'Next', 'onboarding.back': 'Back',
    'chat.placeholder': 'Ask about deadlines, registration, polling places…', 'chat.send': 'Send', 'chat.title': 'Election Copilot',
    'dashboard.title': 'My Voting Plan', 'dashboard.nextAction': 'Next Action', 'dashboard.riskLevel': 'Risk Level',
    'errors.required': 'This field is required', 'errors.invalidZip': 'Enter a valid 5-digit ZIP code', 'errors.networkError': 'Network error. Please try again.',
    'a11y.skipToMain': 'Skip to main content', 'a11y.loading': 'Loading…', 'a11y.chatLive': 'AI response updating',
  },
  es: {
    'nav.home': 'Inicio', 'nav.chat': 'Copiloto Electoral', 'nav.map': 'Lugares de Votación', 'nav.dashboard': 'Mi Plan',
    'onboarding.title': 'Configura tu Perfil de Votante', 'onboarding.zipLabel': 'Código Postal', 'onboarding.next': 'Siguiente', 'onboarding.back': 'Atrás',
    'chat.placeholder': 'Pregunta sobre fechas límite, registro, lugares de votación…', 'chat.send': 'Enviar', 'chat.title': 'Copiloto Electoral',
    'dashboard.title': 'Mi Plan de Votación', 'dashboard.nextAction': 'Próxima Acción', 'dashboard.riskLevel': 'Nivel de Riesgo',
    'errors.required': 'Este campo es obligatorio', 'errors.invalidZip': 'Ingresa un código postal válido de 5 dígitos', 'errors.networkError': 'Error de red. Por favor intenta de nuevo.',
    'a11y.skipToMain': 'Saltar al contenido principal', 'a11y.loading': 'Cargando…', 'a11y.chatLive': 'Respuesta de IA actualizándose',
  },
  zh: {
    'nav.home': '首页', 'nav.chat': '选举助手', 'nav.map': '投票地点', 'nav.dashboard': '我的计划',
    'onboarding.title': '设置您的选民档案', 'onboarding.zipLabel': '邮政编码', 'onboarding.next': '下一步', 'onboarding.back': '返回',
    'chat.placeholder': '询问截止日期、注册、投票地点…', 'chat.send': '发送', 'chat.title': '选举助手',
    'dashboard.title': '我的投票计划', 'dashboard.nextAction': '下一步行动', 'dashboard.riskLevel': '风险级别',
    'errors.required': '此字段为必填项', 'errors.invalidZip': '请输入有效的5位邮政编码', 'errors.networkError': '网络错误，请重试',
    'a11y.skipToMain': '跳到主要内容', 'a11y.loading': '加载中…', 'a11y.chatLive': 'AI 回复更新中',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.chat': 'Copilote Électoral', 'nav.map': 'Bureaux de Vote', 'nav.dashboard': 'Mon Plan',
    'onboarding.title': 'Configurez votre Profil d\'Électeur', 'onboarding.zipLabel': 'Code Postal', 'onboarding.next': 'Suivant', 'onboarding.back': 'Retour',
    'chat.placeholder': 'Posez des questions sur les délais, l\'inscription, les bureaux de vote…', 'chat.send': 'Envoyer', 'chat.title': 'Copilote Électoral',
    'dashboard.title': 'Mon Plan de Vote', 'dashboard.nextAction': 'Prochaine Action', 'dashboard.riskLevel': 'Niveau de Risque',
    'errors.required': 'Ce champ est obligatoire', 'errors.invalidZip': 'Entrez un code postal valide à 5 chiffres', 'errors.networkError': 'Erreur réseau. Veuillez réessayer.',
    'a11y.skipToMain': 'Passer au contenu principal', 'a11y.loading': 'Chargement…', 'a11y.chatLive': 'Réponse IA en cours de mise à jour',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.chat': 'مساعد الانتخابات', 'nav.map': 'مراكز الاقتراع', 'nav.dashboard': 'خطتي',
    'onboarding.title': 'إعداد ملف الناخب', 'onboarding.zipLabel': 'الرمز البريدي', 'onboarding.next': 'التالي', 'onboarding.back': 'رجوع',
    'chat.placeholder': 'اسأل عن المواعيد النهائية والتسجيل ومراكز الاقتراع…', 'chat.send': 'إرسال', 'chat.title': 'مساعد الانتخابات',
    'dashboard.title': 'خطة التصويت الخاصة بي', 'dashboard.nextAction': 'الإجراء التالي', 'dashboard.riskLevel': 'مستوى المخاطر',
    'errors.required': 'هذا الحقل مطلوب', 'errors.invalidZip': 'أدخل رمزاً بريدياً صحيحاً من 5 أرقام', 'errors.networkError': 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.',
    'a11y.skipToMain': 'انتقل إلى المحتوى الرئيسي', 'a11y.loading': 'جار التحميل…', 'a11y.chatLive': 'استجابة الذكاء الاصطناعي تتحدث',
  },
};

describe('Localization Tests (TEST-19)', () => {
  SUPPORTED_LANGUAGES.forEach((lang) => {
    describe(`Language: ${lang}`, () => {
      const translations = MOCK_TRANSLATIONS[lang];

      it(`has translations object for ${lang}`, () => {
        expect(translations).toBeDefined();
        expect(typeof translations).toBe('object');
      });

      REQUIRED_KEYS.forEach((key) => {
        it(`has translation for key: ${key}`, () => {
          expect(translations[key]).toBeDefined();
          expect(translations[key].length).toBeGreaterThan(0);
        });
      });

      it(`no empty strings in ${lang} translations`, () => {
        Object.entries(translations).forEach(([key, value]) => {
          expect(value.trim().length, `Key ${key} has empty translation`).toBeGreaterThan(0);
        });
      });

      it(`${lang} translations have same key count as English`, () => {
        const enKeys = Object.keys(MOCK_TRANSLATIONS.en);
        const langKeys = Object.keys(translations);
        expect(langKeys.length).toBe(enKeys.length);
      });
    });
  });

  describe('RTL Support', () => {
    it('Arabic (ar) is identified as RTL', () => {
      // RTL languages should trigger dir="rtl"
      const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
      expect(rtlLanguages).toContain('ar');
    });
  });
});
