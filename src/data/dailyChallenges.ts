import { BRANCHES } from './curriculum';
import { BranchId, SubjectId } from '../types/bac';

export interface DailyChallengeItem {
  id: string;
  subject: SubjectId;
  kind: 'mcq' | 'puzzle';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  hint: string;
  explanation: string;
  bonusXp: number;
}

export const DAILY_CHALLENGES_BANK: DailyChallengeItem[] = [
  // Physics (الفيزياء)
  {
    id: 'dc-phy-1',
    subject: 'physics',
    kind: 'mcq',
    question:
      'في المتابعة الزمنية لتحول كيميائي بطيء، ما هو التعريف الدقيق لزمن نصف التفاعل t₁/₂؟',
    options: [
      'الزمن اللازم لاستهلاك نصف كمية المتفاعل الزائد',
      'الزمن اللازم لبلوغ التقدم x نصف قيمته النهائية x_f / 2',
      'نصف المدة الزمنية الكلية للتجربة المخبرية',
      'الزمن الموافق لبلوغ السرعة الحجمية قيمتها العظمى',
    ],
    correctIndex: 1,
    hint: 'تذكّر علاقة التقدم x(t₁/₂) بالتقدم النهائي x_f في جدول التقدم.',
    explanation:
      'يُعرّف زمن نصف التفاعل t₁/₂ بالزمن اللازم لبلوغ تقدم التفاعل نصف قيمته النهائية: x(t₁/₂) = x_f / 2.',
    bonusXp: 30,
  },
  {
    id: 'dc-phy-2',
    subject: 'physics',
    kind: 'puzzle',
    question:
      'لغز سريع: نواة مشعة عمر نصفها t₁/₂ = 5 أيام. بعد مرور 15 يوماً، ما الكسر المتبقي من عدد الأنوية الابتدائية N₀؟',
    options: ['N₀ / 3', 'N₀ / 6', 'N₀ / 8', 'N₀ / 16'],
    correctIndex: 2,
    hint: 'احسب عدد أنصاف العمر n = t / t₁/₂ ثم طبّق N(t) = N₀ / 2ⁿ.',
    explanation:
      'بما أن 15 ÷ 5 = 3 أنصاف عمر، فإن عدد الأنوية المتبقية هو N₀ / 2³ = N₀ / 8.',
    bonusXp: 35,
  },
  {
    id: 'dc-phy-3',
    subject: 'physics',
    kind: 'mcq',
    question:
      'في دارة شحن مكثفة عبر ناقل أومي (RC)، ما قيمة النسبة المئوية لتوتر المكثفة u_C عند اللحظة t = τ = RC؟',
    options: ['37% من E', '50% من E', '63% من E', '95% من E'],
    correctIndex: 2,
    hint: 'عوض t = τ في العلاقة u_C(t) = E(1 - e^(-t/τ)) حيث e⁻¹ ≈ 0.37.',
    explanation:
      'عند t = τ يكون u_C(τ) = E(1 - e⁻¹) ≈ 0.63E، أي 63% من القوة المحركة الكهربائية للمولد.',
    bonusXp: 30,
  },
  {
    id: 'dc-phy-4',
    subject: 'physics',
    kind: 'mcq',
    question:
      'في حركة قذيفة في حقل الجاذبية المنتظم (بإهمال مقاومة الهواء)، ماذا يحدث للمركبة الأفقية للسرعة v_x؟',
    options: [
      'تتناقص خطياً حتى تنعدم عند الذروة',
      'تبقى ثابتة طوال المسار لأن ∑F_x = 0',
      'تتزايد باستمرار في مرحلة النزول',
      'تنعكس إشارتها بعد اجتياز الذروة',
    ],
    correctIndex: 1,
    hint: 'أسقط القانون الثاني لنيوتن على المحور الأفقي Ox.',
    explanation:
      'بما أن قوة الثقل شاقولية ولا توجد قوى أفقية، فإن التسارع a_x = 0 ومنه v_x = ثابتة.',
    bonusXp: 30,
  },

  // Natural Sciences (العلوم الطبيعية)
  {
    id: 'dc-sci-1',
    subject: 'science',
    kind: 'mcq',
    question:
      'ما هو الدور الأساسي لأنزيم الـ ARN بوليميراز خلال مرحلة الاستنساخ في النواة؟',
    options: [
      'ربط الأحماض الأمينية بروابط ببتيدية في الهيولى',
      'كسر الروابط الهيدروجينية وتركيب سلسلة ARNm مكملة للسلسلة المستنسخة',
      'تفكيك جزيئة ARNm بعد انتهاء الترجمة',
      'تنشيط الأحماض الأمينية وربطها مع ARNt',
    ],
    correctIndex: 1,
    hint: 'الاستنساخ يحدث داخل النواة ويستهدف تصنيع نسخة ARNm انطلاقاً من الـ ADN.',
    explanation:
      'يقوم ARN بوليميراز بفتح سلسلتي الـ ADN وتكامل النيوكليوتيدات الحرة لتركيب سلسلة ARNm.',
    bonusXp: 30,
  },
  {
    id: 'dc-sci-2',
    subject: 'science',
    kind: 'puzzle',
    question:
      'لغز سريع: قطعة ARNm مكونة من 303 نيوكليوتيدة (باحتساب رامزة التوقف في النهاية). كم عدد الأحماض الأمينية في السلسلة الببتيدية الناتجة؟',
    options: ['101 حمض أميني', '100 حمض أميني', '99 حمض أميني', '300 حمض أميني'],
    correctIndex: 1,
    hint: 'كل رامزة تضم 3 نيوكليوتيدات، ولا تنسَ أن رامزة التوقف لا تُترجم إلى حمض أميني.',
    explanation:
      'العدد الكلي للرامزات = 303 ÷ 3 = 101 رامزة. نطرح رامزة التوقف الواحدة فيتبقى 100 حمض أميني.',
    bonusXp: 35,
  },
  {
    id: 'dc-sci-3',
    subject: 'science',
    kind: 'mcq',
    question:
      'أي خلية مناعية مسؤولة عن إفراز الأجسام المضادة السارية في الاستجابة المناعية الخلطية؟',
    options: [
      'الخلية اللمفاوية التائية السامة LTc',
      'البالعة الكبيرة Macrophage',
      'الخلية البلازمية الناتجة عن تمايز اللمفاويات البائية LB',
      'الخلية التائية المساعدة LTh',
    ],
    correctIndex: 2,
    hint: 'تنتج عن تكاثر وتمايز LB بعد تحفيزها بالأنترلوكين IL-2.',
    explanation:
      'تتمايز اللمفاويات LB المنشطة إلى خلايا بلازمية غنية بالشبكة الهيولية المحببة لإنتاج وإفراز الأجسام المضادة.',
    bonusXp: 30,
  },

  // Mathematics (الرياضيات)
  {
    id: 'dc-math-1',
    subject: 'math',
    kind: 'puzzle',
    question:
      'لغز سريع: إذا كان المستقيم y = 2x - 3 مقارباً مائلاً لمنحنى (C_f) عند +∞، فما قيمة النهاية lim(x→+∞) [f(x) / x]؟',
    options: ['-3', '0', '2', '+∞'],
    correctIndex: 2,
    hint: 'بما أن f(x) - (2x - 3) → 0 عند +∞، قسّم العبارة على x.',
    explanation:
      'لدينا f(x) = 2x - 3 + ε(x) حيث ε(x) → 0، وبالتالي f(x)/x = 2 - 3/x + ε(x)/x تؤول إلى 2.',
    bonusXp: 35,
  },
  {
    id: 'dc-math-2',
    subject: 'math',
    kind: 'mcq',
    question:
      'متتالية هندسية (u_n) حدها الأول u₀ = 3 وأساسها q = 2. ما هو مجموع الحدود السبعة الأولى من u₀ إلى u₆؟',
    options: ['189', '381', '384', '192'],
    correctIndex: 1,
    hint: 'استعمل قانون مجموع متتالية هندسية: S = u₀ · (q^n - 1) / (q - 1) لعدد الحدود n = 7.',
    explanation:
      'عدد الحدود هو 6 - 0 + 1 = 7، ومنه S = 3 × (2⁷ - 1) / (2 - 1) = 3 × 127 = 381.',
    bonusXp: 35,
  },
  {
    id: 'dc-math-3',
    subject: 'math',
    kind: 'mcq',
    question:
      'ما قيمة عمدة العدد المركب z = -1 + i√3 في المجال [0, 2π[؟',
    options: ['π / 3', '2π / 3', '5π / 6', '4π / 3'],
    correctIndex: 1,
    hint: 'الطويلة r = 2، وبما أن cosθ = -1/2 و sinθ = √3/2 فالزاوية تقع في الربع الثاني.',
    explanation:
      'cosθ = -1/2 و sinθ = √3/2 توافق الزاوية π - π/3 = 2π/3.',
    bonusXp: 30,
  },
  {
    id: 'dc-math-4',
    subject: 'math',
    kind: 'mcq',
    question:
      'ما هي الدالة الأصلية للدالة f(x) = e^(3x) على ℝ والتي تنعدم عند x = 0؟',
    options: [
      'F(x) = 3e^(3x) - 3',
      'F(x) = (1/3)e^(3x)',
      'F(x) = (1/3)e^(3x) - 1/3',
      'F(x) = e^(3x) - 1',
    ],
    correctIndex: 2,
    hint: 'مشتق (1/3)e^(3x) هو e^(3x)، ثم احسب الثابت C بحيث F(0) = 0.',
    explanation:
      'F(x) = (1/3)e^(3x) + C. الشرط F(0) = 0 يعطي 1/3 + C = 0 ومنه C = -1/3.',
    bonusXp: 30,
  },

  // Arabic (اللغة العربية)
  {
    id: 'dc-arb-1',
    subject: 'arabic',
    kind: 'mcq',
    question:
      'في البناء اللغوي: ما نوع "إذا" وإعرابها في قولنا: «إذا اجتهدتَ نلتَ التوفيق»؟',
    options: [
      'فجائية مبنية على السكون لا محل لها من الإعراب',
      'ظرف لما يستقبل من الزمن متضمن معنى الشرط، في محل نصب مفعول فيه',
      'تفسيرية مبنية على الفتح',
      'حرف شرط جازم لفعلين مضارعين',
    ],
    correctIndex: 1,
    hint: 'تُفتتح بها جملة شرطية غير جازمة ويدخل بعدَها فعل ماضٍ أو مقدّر.',
    explanation:
      '«إذا» هنا ظرفية شرطية غير جازمة لما يستقبل من الزمن، مبنية على السكون في محل نصب مفعول فيه.',
    bonusXp: 30,
  },
  {
    id: 'dc-arb-2',
    subject: 'arabic',
    kind: 'mcq',
    question:
      'ما الغرض الشعري الذي اشتهر به ابن خلدون أو ابن الوردي في عصر الضعف والانحطاط؟',
    options: [
      'الشعر السياسي التحرري',
      'الشعر التعليمي الداعي إلى الحكم والأخلاق وتبسيط العلوم',
      'الشعر الرومانسي الحزين',
      'شعر الموشحات الأندلسية الغزلية',
    ],
    correctIndex: 1,
    hint: 'راجع خصائص النثر العلمي والشعر التعليمي في محور أدب عصر الضعف.',
    explanation:
      'برز الشعر التعليمي والزهد في عصر الضعف والانحطاط، حيث نظم الشعراء العلوم والأخلاق في قصائد سهلة الحفظ.',
    bonusXp: 30,
  },
  {
    id: 'dc-arb-3',
    subject: 'arabic',
    kind: 'puzzle',
    question:
      'لغز بلاغي: في قول الشاعر «بكت السماءُ على فراق الأحبة»، ما نوع الصورة البيانية وما سر بلاغتها؟',
    options: [
      'تشبيه بليغ يوضح درجة الحزن',
      'استعارة تصريحية لتشبيه المطر بالدمع فقط',
      'استعارة مكنية حيث شُبّهت السماء بالإنسان وحُذف المشبّه به مع ترك قرينة «بكت»',
      'كناية عن صفة الغزارة',
    ],
    correctIndex: 2,
    hint: 'هل ذُكر الإنسان أم رُمز له بأحد لوازمه (البكاء)؟',
    explanation:
      'حُذف المشبّه به (الإنسان) وتُركت قرينة دالة عليه وهي «بكت»، فهي استعارة مكنية سر بلاغتها التشخيص.',
    bonusXp: 30,
  },

  // Philosophy (الفلسفة)
  {
    id: 'dc-phi-1',
    subject: 'philosophy',
    kind: 'mcq',
    question:
      'في منهجية المقال الفلسفي، متى نستخدم طريقة الاستقصاء بالوضع؟',
    options: [
      'عندما يطلب السؤال الموازنة بين مفهومين متقاربين',
      'عندما يعطينا السؤال أطروحة واحدة ويطلب إثبات صحتها والدفاع عنها',
      'عندما يتعارض موقفان فلسفيان في صيغة «هل»',
      'عند تحليل نص فلسفي قصير',
    ],
    correctIndex: 1,
    hint: 'ابحث عن صيغ مثل: «دافع عن الأطروحة القائلة...» أو «أثبت صحة الرأي...».',
    explanation:
      'الاستقصاء بالوضع يُستعمل لإثبات صحة أطروحة واحدة وتفنيد خصومها عبر خطوات عرض منطق الأطروحة ونقد الخصوم.',
    bonusXp: 30,
  },
  {
    id: 'dc-phi-2',
    subject: 'philosophy',
    kind: 'mcq',
    question:
      'أي فيلسوف يُنسب إليه القول بأن «المشكلة هي التساؤل العلمي البسيط بينما الإشكالية هي المعضلة الفلسفية المفتوحة التي لا تقبل حلاً نهائياً»؟',
    options: [
      'جون ديوي وجميل صليبا في التمييز بين العلمي والفلسفي',
      'إيمانويل كانط في نقد العقل الخالص فقط',
      'سيغموند فرويد في مدرسة التحليل النفسي',
      'أوغست كونت في قانون الحالات الثلاث',
    ],
    correctIndex: 0,
    hint: 'تذكّر درس المشكلة العلمية والإشكالية الفلسفية في مطلع البرنامج.',
    explanation:
      'يميّز الفلاسفة والمفكرون كجميل صليبا وجون ديوي بين المشكلة العلمية الجزئية القابلة للحل والإشكالية الفلسفية الكلية.',
    bonusXp: 30,
  },

  // History & Geography (تاريخ وجغرافيا)
  {
    id: 'dc-his-1',
    subject: 'history',
    kind: 'mcq',
    question:
      'في أي تاريخ انعقد مؤتمر الصومام الذي نظّم الثورة التحريرية الجزائرية مؤسساتياً وعسكرياً؟',
    options: [
      '20 أوت 1955',
      '20 أوت 1956',
      '19 ماي 1956',
      '18 فيفري 1957',
    ],
    correctIndex: 1,
    hint: 'جاء بعد عام كامل من هجومات الشمال القسنطيني.',
    explanation:
      'انعقد مؤتمر الصومام يوم 20 أوت 1956 بإيفري أوزلاقن وأرسى مبدأ أولوية الداخل على الخارج والسياسي على العسكري.',
    bonusXp: 30,
  },
  {
    id: 'dc-his-2',
    subject: 'history',
    kind: 'mcq',
    question:
      'ما الهدف الرئيسي من «مبدأ ترومان» المعلن في 12 مارس 1947 خلال الحرب الباردة؟',
    options: [
      'تقديم مساعدات مالية لدول أوروبا الشرقية الاشتراكية',
      'دعم اليونان وتركيا للوقوف ضد المد الشيوعي السوفياتي (سياسة الاحتواء)',
      'تأسيس حركة عدم الانحياز في باندونغ',
      'إنهاء أزمة الصواريخ في كوبا',
    ],
    correctIndex: 1,
    hint: 'كان أول تطبيق عملي لسياسة الاحتواء الأمريكية.',
    explanation:
      'أعلن الرئيس الأمريكي هاري ترومان عن دعم مالي وعسكري لليونان وتركيا لمنع انتشار الشيوعية في إطار سياسة الاحتواء.',
    bonusXp: 30,
  },
  {
    id: 'dc-his-3',
    subject: 'history',
    kind: 'puzzle',
    question:
      'لغز جغرافي: ما هو الإقليم الذي يُعرف في الجغرافيا الاقتصادية بـ «حزام التصنيع» وتقع فيه معظم البورصات والشركات الكبرى بالولايات المتحدة؟',
    options: [
      'الإقليم الجنوبي الحديث',
      'الإقليم الشمالي الشرقي',
      'إقليم السهول الوسطى',
      'إقليم الجبال الصخرية',
    ],
    correctIndex: 1,
    hint: 'يضم نيويورك، واشنطن، وبحيرات الشمال الكبرى (الميغالوبوليس).',
    explanation:
      'الإقليم الشمالي الشرقي هو القلب الاقتصادي والتاريخي للولايات المتحدة ويضم أكبر تجمع حضري وصناعي.',
    bonusXp: 30,
  },

  // Islamic Sciences (التربية الإسلامية)
  {
    id: 'dc-isl-1',
    subject: 'islamic',
    kind: 'mcq',
    question:
      'من بين وسائل تثبيت العقيدة الإسلامية في القرآن الكريم، أي وسيلة تعالج انحرافات النفس ببيان عواقب الكبر والغفلة؟',
    options: [
      'رسم الصور المحببة للمؤمنين',
      'رسم صور الكافرين المنفرة',
      'التذكير بمراقبة الله لخلقه',
      'القياس الشرعي',
    ],
    correctIndex: 1,
    hint: 'راجع الوسائل الخمس لتثبيت العقيدة الإسلامية.',
    explanation:
      'رسم صور الكافرين المنفرة يكشف سوء عاقبة الغفلة والتكبر ويدفع المؤمن لاجتناب صفاتهم.',
    bonusXp: 30,
  },
  {
    id: 'dc-isl-2',
    subject: 'islamic',
    kind: 'mcq',
    question:
      'في درس المقاصد الشرعية، في أي مرتبة يندرج تحريم المخدرات حفظاً للعقل؟',
    options: [
      'التحسينيات',
      'الحاجيات',
      'الضروريات (حفظ العقل)',
      'المندوبات',
    ],
    correctIndex: 2,
    hint: 'المقاصد الضرورية الخمس هي: الدين، النفس، العقل، النسل، المال.',
    explanation:
      'تحريم المسكرات والمخدرات يحمي الضرورة الثالثة من الضروريات الخمس وهي حفظ العقل.',
    bonusXp: 30,
  },

  // French (اللغة الفرنسية)
  {
    id: 'dc-fr-1',
    subject: 'french',
    kind: 'mcq',
    question:
      'Dans un « Compte Rendu Objectif » d’un texte historique au Bac, quel pronom doit-on privilégier ?',
    options: [
      '« Je » pour donner son avis personnel sur la guerre',
      '« L’auteur » ou la 3e personne (il / elle) sans jugement personnel',
      '« Nous » pour impliquer le lecteur directement',
      '« Tu » sous forme de dialogue',
    ],
    correctIndex: 1,
    hint: 'الموضوعية (Objectivité) تعني غياب رأي المترشح الشخصي.',
    explanation:
      'في Compte Rendu Objectif نلتزم بضمير الغائب (L’auteur explique / montre que...) دون استعمال «Je».',
    bonusXp: 30,
  },
  {
    id: 'dc-fr-2',
    subject: 'french',
    kind: 'puzzle',
    question:
      'Choisis le rapport logique exprimé par « bien que » suivi du subjonctif : « Bien qu’il soit fatigué, il révise ses leçons. »',
    options: ['La cause', 'La conséquence', 'La concession / opposition', 'Le but'],
    correctIndex: 2,
    hint: 'تربط بين فكرتين متعارضتين (التعب مقابل المراجعة).',
    explanation:
      'الأداة « bien que » تعبّر عن التناقض/الاستدراك (La concession) وتُتبع دائماً بصيغة Subjonctif.',
    bonusXp: 30,
  },

  // English (اللغة الإنجليزية)
  {
    id: 'dc-eng-1',
    subject: 'english',
    kind: 'mcq',
    question:
      'Choose the correct form: "If students revised regularly, they ________ stressed before the Bac exam."',
    options: [
      'will not feel',
      'would not feel',
      'would not have felt',
      'do not feel',
    ],
    correctIndex: 1,
    hint: 'لاحظ زمن فعل الشرط "revised" (Past Simple) -> Conditional Type 2.',
    explanation:
      'في الجملة الشرطية من النوع الثاني (Type 2: If + Past Simple)، يكون جواب الشرط بـ would + verb stem.',
    bonusXp: 30,
  },
  {
    id: 'dc-eng-2',
    subject: 'english',
    kind: 'mcq',
    question:
      'In the unit "Ethics in Business", which term means "offering money illegally to influence an official"?',
    options: ['Nepotism', 'Bribery', 'Embezzlement', 'Whistleblowing'],
    correctIndex: 1,
    hint: 'المقابل العربي هو «الرشوة».',
    explanation:
      'Bribery تعني الرشوة، بينما Nepotism تعني المحسوبية وEmbezzlement تعني اختلاس الأموال.',
    bonusXp: 30,
  },
];

export function getDailyChallengeForDay(
  day: number,
  branch: BranchId
): DailyChallengeItem {
  const clampedDay = Math.max(1, Math.floor(day));
  const branchInfo = BRANCHES.find((b) => b.id === branch);
  const allowedSubjects = new Set<SubjectId>(
    branchInfo?.coreSubjects ?? ['physics', 'math', 'arabic']
  );

  const branchPool = DAILY_CHALLENGES_BANK.filter((item) =>
    allowedSubjects.has(item.subject)
  );
  const pool = branchPool.length > 0 ? branchPool : DAILY_CHALLENGES_BANK;

  return pool[(clampedDay - 1) % pool.length];
}
