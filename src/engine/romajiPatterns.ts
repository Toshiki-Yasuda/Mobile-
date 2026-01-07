/**
 * ローマ字入力パターン定義
 * 
 * 複数の入力方法に対応するため、各ひらがなに対して
 * 許容されるすべてのローマ字パターンを定義
 */

/**
 * ひらがな → ローマ字パターンのマッピング
 * 配列の最初の要素が「推奨」パターン（表示用）
 */
export const ROMAJI_PATTERNS: Record<string, string[]> = {
  // ===== 基本母音 =====
  'あ': ['a'],
  'い': ['i', 'yi'],
  'う': ['u', 'wu', 'whu'],
  'え': ['e'],
  'お': ['o'],

  // ===== 小さい母音 =====
  'ぁ': ['xa', 'la'],
  'ぃ': ['xi', 'li', 'xyi', 'lyi'],
  'ぅ': ['xu', 'lu'],
  'ぇ': ['xe', 'le', 'xye', 'lye'],
  'ぉ': ['xo', 'lo'],

  // ===== か行 =====
  'か': ['ka', 'ca'],
  'き': ['ki'],
  'く': ['ku', 'cu', 'qu'],
  'け': ['ke'],
  'こ': ['ko', 'co'],

  // ===== が行 =====
  'が': ['ga'],
  'ぎ': ['gi'],
  'ぐ': ['gu'],
  'げ': ['ge'],
  'ご': ['go'],

  // ===== さ行 =====
  'さ': ['sa'],
  'し': ['si', 'shi', 'ci'],
  'す': ['su'],
  'せ': ['se', 'ce'],
  'そ': ['so'],

  // ===== ざ行 =====
  'ざ': ['za'],
  'じ': ['zi', 'ji'],
  'ず': ['zu'],
  'ぜ': ['ze'],
  'ぞ': ['zo'],

  // ===== た行 =====
  'た': ['ta'],
  'ち': ['ti', 'chi'],
  'つ': ['tu', 'tsu'],
  'て': ['te'],
  'と': ['to'],

  // ===== だ行 =====
  'だ': ['da'],
  'ぢ': ['di', 'zi'],
  'づ': ['du', 'dzu', 'zu'],
  'で': ['de'],
  'ど': ['do'],

  // ===== な行 =====
  'な': ['na'],
  'に': ['ni'],
  'ぬ': ['nu'],
  'ね': ['ne'],
  'の': ['no'],

  // ===== は行 =====
  'は': ['ha'],
  'ひ': ['hi'],
  'ふ': ['hu', 'fu'],
  'へ': ['he'],
  'ほ': ['ho'],

  // ===== ば行 =====
  'ば': ['ba'],
  'び': ['bi'],
  'ぶ': ['bu'],
  'べ': ['be'],
  'ぼ': ['bo'],

  // ===== ぱ行 =====
  'ぱ': ['pa'],
  'ぴ': ['pi'],
  'ぷ': ['pu'],
  'ぺ': ['pe'],
  'ぽ': ['po'],

  // ===== ま行 =====
  'ま': ['ma'],
  'み': ['mi'],
  'む': ['mu'],
  'め': ['me'],
  'も': ['mo'],

  // ===== や行 =====
  'や': ['ya'],
  'ゆ': ['yu'],
  'よ': ['yo'],

  // ===== 小さいや行 =====
  'ゃ': ['xya', 'lya'],
  'ゅ': ['xyu', 'lyu'],
  'ょ': ['xyo', 'lyo'],

  // ===== ら行 =====
  'ら': ['ra', 'la'],
  'り': ['ri', 'li'],
  'る': ['ru', 'lu'],
  'れ': ['re', 'le'],
  'ろ': ['ro', 'lo'],

  // ===== わ行 =====
  'わ': ['wa'],
  'を': ['wo', 'o'],

  // ===== ん（特殊処理が必要） =====
  // 基本パターン。実際の判定では後続文字を見て判断
  'ん': ['nn', "n'", 'xn', 'ln'],

  // ===== 拗音（きゃ行） =====
  'きゃ': ['kya', 'kilya', 'kixya'],
  'きゅ': ['kyu', 'kilyu', 'kixyu'],
  'きょ': ['kyo', 'kilyo', 'kixyo'],

  // ===== 拗音（ぎゃ行） =====
  'ぎゃ': ['gya', 'gilya', 'gixya'],
  'ぎゅ': ['gyu', 'gilyu', 'gixyu'],
  'ぎょ': ['gyo', 'gilyo', 'gixyo'],

  // ===== 拗音（しゃ行） =====
  'しゃ': ['sya', 'sha', 'silya', 'sixya', 'shilya', 'shixya'],
  'しゅ': ['syu', 'shu', 'silyu', 'sixyu', 'shilyu', 'shixyu'],
  'しょ': ['syo', 'sho', 'silyo', 'sixyo', 'shilyo', 'shixyo'],

  // ===== 拗音（じゃ行） =====
  'じゃ': ['zya', 'ja', 'jya', 'zilya', 'zixya', 'jilya', 'jixya'],
  'じゅ': ['zyu', 'ju', 'jyu', 'zilyu', 'zixyu', 'jilyu', 'jixyu'],
  'じょ': ['zyo', 'jo', 'jyo', 'zilyo', 'zixyo', 'jilyo', 'jixyo'],

  // ===== 拗音（ちゃ行） =====
  'ちゃ': ['tya', 'cha', 'tilya', 'tixya', 'chilya', 'chixya', 'cya'],
  'ちゅ': ['tyu', 'chu', 'tilyu', 'tixyu', 'chilyu', 'chixyu', 'cyu'],
  'ちょ': ['tyo', 'cho', 'tilyo', 'tixyo', 'chilyo', 'chixyo', 'cyo'],

  // ===== 拗音（ぢゃ行） =====
  'ぢゃ': ['dya', 'dilya', 'dixya'],
  'ぢゅ': ['dyu', 'dilyu', 'dixyu'],
  'ぢょ': ['dyo', 'dilyo', 'dixyo'],

  // ===== 拗音（にゃ行） =====
  'にゃ': ['nya', 'nilya', 'nixya'],
  'にゅ': ['nyu', 'nilyu', 'nixyu'],
  'にょ': ['nyo', 'nilyo', 'nixyo'],

  // ===== 拗音（ひゃ行） =====
  'ひゃ': ['hya', 'hilya', 'hixya'],
  'ひゅ': ['hyu', 'hilyu', 'hixyu'],
  'ひょ': ['hyo', 'hilyo', 'hixyo'],

  // ===== 拗音（びゃ行） =====
  'びゃ': ['bya', 'bilya', 'bixya'],
  'びゅ': ['byu', 'bilyu', 'bixyu'],
  'びょ': ['byo', 'bilyo', 'bixyo'],

  // ===== 拗音（ぴゃ行） =====
  'ぴゃ': ['pya', 'pilya', 'pixya'],
  'ぴゅ': ['pyu', 'pilyu', 'pixyu'],
  'ぴょ': ['pyo', 'pilyo', 'pixyo'],

  // ===== 拗音（みゃ行） =====
  'みゃ': ['mya', 'milya', 'mixya'],
  'みゅ': ['myu', 'milyu', 'mixyu'],
  'みょ': ['myo', 'milyo', 'mixyo'],

  // ===== 拗音（りゃ行） =====
  'りゃ': ['rya', 'rilya', 'rixya'],
  'りゅ': ['ryu', 'rilyu', 'rixyu'],
  'りょ': ['ryo', 'rilyo', 'rixyo'],

  // ===== 促音（っ） =====
  // 単体の場合。子音重ねは動的に処理
  'っ': ['xtu', 'xtsu', 'ltu', 'ltsu'],

  // ===== 小さいわ =====
  'ゎ': ['xwa', 'lwa'],

  // ===== 長音 =====
  'ー': ['-'],

  // ===== 特殊（外来語） =====
  'ゔ': ['vu'],
  'ゔぁ': ['va', 'vuxa', 'vula'],
  'ゔぃ': ['vi', 'vyi', 'vuxi', 'vuli'],
  'ゔぇ': ['ve', 'vye', 'vuxe', 'vule'],
  'ゔぉ': ['vo', 'vuxo', 'vulo'],
  'ゔゅ': ['vyu', 'vuxyu', 'vulyu'],

  // ===== シェ・チェ・ジェ等 =====
  'しぇ': ['she', 'sye', 'sixe', 'sile', 'shixe', 'shile'],
  'ちぇ': ['che', 'tye', 'cye', 'tixe', 'tile', 'chixe', 'chile', 'cixe', 'cile'],
  'じぇ': ['je', 'zye', 'jye', 'zixe', 'zile', 'jixe', 'jile'],
  'きぇ': ['kye', 'kixe', 'kile'],
  'ぎぇ': ['gye', 'gixe', 'gile'],
  'にぇ': ['nye', 'nixe', 'nile'],
  'ひぇ': ['hye', 'hixe', 'hile'],
  'びぇ': ['bye', 'bixe', 'bile'],
  'ぴぇ': ['pye', 'pixe', 'pile'],
  'みぇ': ['mye', 'mixe', 'mile'],
  'りぇ': ['rye', 'rixe', 'rile'],

  // ===== ティ・ディ・トゥ・ドゥ =====
  'てぃ': ['thi', 'texi', 'teli'],
  'でぃ': ['dhi', 'dexi', 'deli'],
  'てゅ': ['thu', 'texyu', 'telyu'],
  'でゅ': ['dhu', 'dexyu', 'delyu'],
  'とぅ': ['twu', 'toxu', 'tolu'],
  'どぅ': ['dwu', 'doxu', 'dolu'],

  // ===== ファ行 =====
  'ふぁ': ['fa', 'huxa', 'hula', 'fuxa', 'fula'],
  'ふぃ': ['fi', 'huxi', 'huli', 'fuxi', 'fuli'],
  'ふぇ': ['fe', 'huxe', 'hule', 'fuxe', 'fule'],
  'ふぉ': ['fo', 'huxo', 'hulo', 'fuxo', 'fulo'],
  'ふゅ': ['fyu', 'huxyu', 'hulyu', 'fuxyu', 'fulyu'],

  // ===== イェ =====
  'いぇ': ['ye', 'ixe', 'ile'],

  // ===== ウィ・ウェ・ウォ =====
  'うぃ': ['wi', 'uxi', 'uli', 'whi'],
  'うぇ': ['we', 'uxe', 'ule', 'whe'],
  'うぉ': ['who', 'uxo', 'ulo', 'wo'],

  // ===== クァ行 =====
  'くぁ': ['qa', 'kuxa', 'kula', 'qwa'],
  'くぃ': ['qi', 'kuxi', 'kuli', 'qwi'],
  'くぅ': ['qwu', 'kuxu', 'kulu'],
  'くぇ': ['qe', 'kuxe', 'kule', 'qwe'],
  'くぉ': ['qo', 'kuxo', 'kulo', 'qwo'],

  // ===== グァ行 =====
  'ぐぁ': ['gwa', 'guxa', 'gula'],
  'ぐぃ': ['gwi', 'guxi', 'guli'],
  'ぐぅ': ['gwu', 'guxu', 'gulu'],
  'ぐぇ': ['gwe', 'guxe', 'gule'],
  'ぐぉ': ['gwo', 'guxo', 'gulo'],

  // ===== ツァ行 =====
  'つぁ': ['tsa', 'tuxa', 'tula'],
  'つぃ': ['tsi', 'tuxi', 'tuli'],
  'つぇ': ['tse', 'tuxe', 'tule'],
  'つぉ': ['tso', 'tuxo', 'tulo'],

  // ===== 記号 =====
  '。': ['.'],
  '、': [','],
  '・': ['/'],
  '「': ['['],
  '」': [']'],
  '！': ['!'],
  '？': ['?'],
  '〜': ['~'],
};

/**
 * 促音（っ）の後に来る子音で、重ねて入力可能なもの
 */
export const SOKUON_CONSONANTS = new Set([
  'k', 'g', 's', 'z', 't', 'd', 'h', 'b', 'p', 'm', 'r', 'w',
  'c', 'f', 'j', 'q', 'v', 'y', 'n'
]);

/**
 * 「ん」の後に来ると nn が必須になる文字の先頭
 */
export const N_REQUIRES_DOUBLE = new Set(['a', 'i', 'u', 'e', 'o', 'y', 'n']);

/**
 * 「ん」の後に来ると n 単体でOKになる子音
 */
export const N_SINGLE_OK_CONSONANTS = new Set([
  'k', 'g', 's', 'z', 't', 'd', 'h', 'b', 'p', 'm', 'r', 'w',
  'c', 'f', 'j', 'q', 'v'
]);
