export type BreakTierId = 'sprint' | 'balanced' | 'deep' | 'marathon';

export interface BreakExerciseStep {
  id: string;
  label: string;
  durationHint: string;
}

export interface BreakRecommendation {
  tier: BreakTierId;
  sessionMinutes: number;
  breakMinutes: number;
  titleAr: string;
  categoryLabelAr: string;
  rationaleAr: string;
  hydrationTipAr: string;
  steps: BreakExerciseStep[];
}

export function resolveCompletedSessionMinutes(
  selectedDurationMin: number,
  secondsLeft: number
): number {
  const safeDuration = Math.max(1, Math.round(selectedDurationMin));
  const totalSeconds = safeDuration * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - Math.max(0, secondsLeft));

  // If timer completed naturally or user finished within the first minute as a quick log,
  // use the selected session block duration; otherwise use actual elapsed minutes.
  if (secondsLeft <= 0 || elapsedSeconds < 60) {
    return safeDuration;
  }

  return Math.max(1, Math.round(elapsedSeconds / 60));
}

export function getBreakRecommendation(sessionMinutes: number): BreakRecommendation {
  const normalizedMin = Math.max(1, Math.round(sessionMinutes));

  if (normalizedMin <= 25) {
    return {
      tier: 'sprint',
      sessionMinutes: normalizedMin,
      breakMinutes: 5,
      titleAr: 'إراحة العينين وفكّ تشنّج الرقبة',
      categoryLabelAr: 'استراحة سريعة',
      rationaleAr:
        'جلسات 25 دقيقة تترك أثراً مباشراً على تركيز العينين وعضلات الرقبة؛ تمدّد قصير يعيد النشاط فوراً.',
      hydrationTipAr: 'اشرب نصف كوب ماء بارد قبل العودة للمؤقت.',
      steps: [
        {
          id: 'sprint-eye-2020',
          label: 'قاعدة 20-20-20: انظر لنقطة بعيدة خارج الشاشة أو الدفتر',
          durationHint: '20 ثانية',
        },
        {
          id: 'sprint-neck-tilt',
          label: 'إمالة الرأس بلطف نحو اليمين ثم اليسار لفكّ شدّ الرقبة',
          durationHint: '30 ثانية',
        },
        {
          id: 'sprint-shoulder-roll',
          label: 'تدوير الكتفين للخلف 8 مرات ببطء مع تنفّس منتظم',
          durationHint: '45 ثانية',
        },
      ],
    };
  }

  if (normalizedMin <= 45) {
    return {
      tier: 'balanced',
      sessionMinutes: normalizedMin,
      breakMinutes: 10,
      titleAr: 'تمدّد الظهر والمعصمين مع تنفّس عميق',
      categoryLabelAr: 'توازن جسدي وذهني',
      rationaleAr:
        'بعد 45 دقيقة من الحل والكتابة، يحتاج العمود الفقري والمعصمان إلى إرخاء متدرّج لتفادي التعب.',
      hydrationTipAr: 'قف من مقعدك واشرب كوب ماء كاملاً.',
      steps: [
        {
          id: 'balanced-wrist',
          label: 'شدّ أصابع اليد والمعصم بلطف للأمام وللأسفل بعد الكتابة',
          durationHint: '30 ثانية لكل يد',
        },
        {
          id: 'balanced-spine',
          label: 'الوقوف وتشبيك اليدين للأعلى لتمديد الظهر والصدر',
          durationHint: '45 ثانية',
        },
        {
          id: 'balanced-box-breath',
          label: 'تنفّس مربّع (شهيق 4 ثوانٍ · حبس 4 · زفير 4) لتهدئة التوتر',
          durationHint: 'دقيقتان',
        },
      ],
    };
  }

  if (normalizedMin <= 60) {
    return {
      tier: 'deep',
      sessionMinutes: normalizedMin,
      breakMinutes: 12,
      titleAr: 'نشاط حركي خفيف وتجديد الدورة الدموية',
      categoryLabelAr: 'تنشيط الدورة الدموية',
      rationaleAr:
        'ساعة كاملة من الجلوس المتواصل تبطئ تدفّق الدم؛ الحركة الخفيفة ترفع الأكسجين وتستعيد صفاء الذهن.',
      hydrationTipAr: 'اغسل وجهك بماء منعش واشرب كوب ماء قبل الجلسة المقبلة.',
      steps: [
        {
          id: 'deep-walk',
          label: 'مشي خفيف داخل الغرفة أو الممر بعيداً عن المكتب',
          durationHint: '3 دقائق',
        },
        {
          id: 'deep-chest-open',
          label: 'فتح الصدر وتمديد الكتفين للخلف لتصحيح وضعية الجلوس',
          durationHint: 'دقيقة واحدة',
        },
        {
          id: 'deep-calf-knee',
          label: 'رفع الركبتين بالتناوب والوقوف على أطراف الأصابع 12 مرة',
          durationHint: 'دقيقتان',
        },
      ],
    };
  }

  return {
    tier: 'marathon',
    sessionMinutes: normalizedMin,
    breakMinutes: 15,
    titleAr: 'إعادة شحن شاملة بعد جلسة ماراثون البكالوريا',
    categoryLabelAr: 'استشفاء كامل',
    rationaleAr:
      'إنهاء أكثر من 60 دقيقة متواصلة يشبه مدة امتحان حقيقي؛ جسمك وعقلك بحاجة لاستراحة فعلية بعيداً عن الدراسة.',
    hydrationTipAr: 'تناول فاكهة أو مكسّرات خفيفة مع كوب ماء كبير.',
    steps: [
      {
        id: 'marathon-step-away',
        label: 'الابتعاد تماماً عن المكتب والهاتف والتعرّض لضوء طبيعي',
        durationHint: '5 دقائق',
      },
      {
        id: 'marathon-full-stretch',
        label: 'سلسلة تمدّد كاملة: الرقبة + الكتفين + أسفل الظهر والساقين',
        durationHint: '3 دقائق',
      },
      {
        id: 'marathon-snack',
        label: 'ترطيب الجسم بالماء وتناول وجبة خفيفة تمنح طاقة ثابتة',
        durationHint: '4 دقائق',
      },
      {
        id: 'marathon-reset',
        label: 'تنفّس عميق وتجهيز نية وهدف المادة التالية بهدوء',
        durationHint: '3 دقائق',
      },
    ],
  };
}
