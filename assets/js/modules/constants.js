/** @const {object} */
const SUBSETS_PANGRAMS = {
	'arabic': 'الحب سماء لا تمطر غير الأحلام.',
	'bengali': 'আগুনের শিখা নিভে গিয়েছিল, আর তিনি জানলা দিয়ে তারাদের দিকে তাকালেন৷',
	'chinese-hongkong':    '他們所有的設備和儀器彷彿都是有生命的。',
	'chinese-simplified':  '他们所有的设备和仪器彷佛都是有生命的。',
	'chinese-traditional': '他們所有的設備和儀器彷彿都是有生命的。',
	'cyrillic': 'Алая вспышка осветила силуэт зазубренного крыла.',
	'cyrillic-ext': 'Жебракують філософи при ґанку церкви в Гадячі, ще й шатро їхнє п’яне знаємо.',
	'devanagari': 'अंतरिक्ष यान से दूर नीचे पृथ्वी शानदार ढंग से जगमगा रही थी ।',
	'greek': 'Ήταν απλώς θέμα χρόνου.',
	'greek-ext': 'Ήταν απλώς θέμα χρόνου.',
	'gujarati': 'અમને તેની જાણ થાય તે પહેલાં જ, અમે જમીન છોડી દીધી હતી.',
	'gurmukhi': 'ਸਵਾਲ ਸਿਰਫ਼ ਸਮੇਂ ਦਾ ਸੀ।',
	'hebrew': 'אז הגיע הלילה של כוכב השביט הראשון.',
	'japanese': '彼らの機器や装置はすべて生命体だ。',
	'kannada': 'ಇದು ಕೇವಲ ಸಮಯದ ಪ್ರಶ್ನೆಯಾಗಿದೆ.',
	'khmer': 'ខ្ញុំបានមើលព្យុះ ដែលមានភាពស្រស់ស្អាតណាស់ ប៉ុន្តែគួរឲ្យខ្លាច',
	'korean': '그들의 장비와 기구는 모두 살아 있다.',
	'latin': 'Almost before we knew it, we had left the ground.',
	'latin-ext': 'Almost before we knew it, we had left the ground.',
	'malayalam': 'അവരുടെ എല്ലാ ഉപകരണങ്ങളും യന്ത്രങ്ങളും ഏതെങ്കിലും രൂപത്തിൽ സജീവമാണ്.',
	'myanmar': 'သူတို့ရဲ့ စက်ပစ္စည်းတွေ၊ ကိရိယာတွေ အားလုံး အသက်ရှင်ကြတယ်။',
	'oriya': 'ଏହା କେବଳ ଏକ ସମୟ କଥା ହିଁ ଥିଲା.',
	'sinhala': 'එය කාලය පිළිබඳ ප්‍රශ්නයක් පමණක් විය.',
	'tamil': 'அந்திமாலையில், அலைகள் வேகமாக வீசத் தொடங்கின.',
	'telugu': 'ఆ రాత్రి మొదటిసారిగా ఒక నక్షత్రం నేలరాలింది.',
	'thai': 'การเดินทางขากลับคงจะเหงา',
	'tibetan': 'ཁོ་ཚོའི་སྒྲིག་ཆས་དང་ལག་ཆ་ཡོད་ཚད་གསོན་པོ་རེད།',
	'vietnamese': 'Bầu trời trong xanh thăm thẳm, không một gợn mây.'
}

/** @const {array} */
const RTL_SUBSETS = ['arabic', 'hebrew'];

/** @const {object} */
const VARIANTS_EXPLICATION = {
	'100': {
		fontWeight: '100'
	},
	'200': {
		fontWeight: '200'
	},
	'300': {
		fontWeight: '300'
	},
	'regular': {
		fontWeight: '400'
	},
	'500': {
		fontWeight: '500'
	},
	'600': {
		fontWeight: '600'
	},
	'700': {
		fontWeight: '700'
	},
	'800': {
		fontWeight: '800'
	},
	'900': {
		fontWeight: '900'
	},
	'100italic': {
		fontWeight: '100',
		fontStyle: 'italic'
	},
	'200italic': {
		fontWeight: '200',
		fontStyle: 'italic'
	},
	'300italic': {
		fontWeight: '300',
		fontStyle: 'italic'
	},
	'italic': {
		fontWeight: '400',
		fontStyle: 'italic'
	},
	'500italic': {
		fontWeight: '500',
		fontStyle: 'italic'
	},
	'600italic': {
		fontWeight: '600',
		fontStyle: 'italic'
	},
	'700italic': {
		fontWeight: '700',
		fontStyle: 'italic'
	},
	'800italic': {
		fontWeight: '800',
		fontStyle: 'italic'
	},
	'900italic': {
		fontWeight: '900',
		fontStyle: 'italic'
	}
};

/** @const {object} */
const WEIGHT_NAME = {
	'100': 'Thin',
	'200': 'Extra-light',
	'300': 'Light',
	'400': 'Regular',
	'500': 'Medium',
	'600': 'Semi-bold',
	'700': 'Bold',
	'800': 'Extra-bold',
	'900': 'Black'
}

export {SUBSETS_PANGRAMS, RTL_SUBSETS, VARIANTS_EXPLICATION, WEIGHT_NAME};