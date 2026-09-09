// Curated character dataset for the Oracle Bone Script Explorer.
//
// SCHEMA (one object per character):
//   char        {string}  modern glyph (traditional/standard form used across CJK)
//   pinyin      {string}  Mandarin reading (for reference)
//   gloss       {string}  short English meaning (adapted from CC-CEDICT)
//   type        {string}  formation category: "pictograph" | "ideograph" | "compound"
//   origin      {string}  the pictographic-origin story (the "elaborative" content
//                         whose memory effect the experiment tests)
//   obcImage    {string}  filename of the oracle bone image in /public/obc/
//                         (populated by extract_obc.py from the HUST-OBC dataset)
//   evolution   {array}   optional list of {stage, image} for the evolution strip
//
// The `origin` text is the independent-variable content: in the experiment's
// "with-origin" condition learners see it; in the "gloss-only" condition they do not.
//
// Sources: etymologies synthesised from Wiktionary / standard references; glosses
// adapted from CC-CEDICT. Oracle bone imagery from HUST-OBC (see README).

export const CHARACTERS = [
  {
    char: '日',
    pinyin: 'rì',
    gloss: 'sun; day',
    type: 'pictograph',
    origin:
      'A drawing of the sun: a round disc with a mark in the centre. The rounded ' +
      'oracle-bone shape was later squared off into the modern box 日.',
    obcImage: 'ri.png',
  },
  {
    char: '月',
    pinyin: 'yuè',
    gloss: 'moon; month',
    type: 'pictograph',
    origin:
      'A picture of a crescent moon. It was drawn as a curved sliver to distinguish ' +
      'it from the round sun 日.',
    obcImage: 'yue.png',
  },
  {
    char: '山',
    pinyin: 'shān',
    gloss: 'mountain',
    type: 'pictograph',
    origin:
      'A drawing of three peaks rising from a base — a mountain range seen on the ' +
      'horizon. The three points survive in the modern form.',
    obcImage: 'shan.png',
  },
  {
    char: '水',
    pinyin: 'shuǐ',
    gloss: 'water',
    type: 'pictograph',
    origin:
      'A picture of a flowing stream: a central current with droplets or ripples on ' +
      'either side.',
    obcImage: 'shui.png',
  },
  {
    char: '木',
    pinyin: 'mù',
    gloss: 'tree; wood',
    type: 'pictograph',
    origin:
      'A tree with branches reaching up and roots spreading down from a central ' +
      'trunk.',
    obcImage: 'mu.png',
  },
  {
    char: '火',
    pinyin: 'huǒ',
    gloss: 'fire',
    type: 'pictograph',
    origin:
      'A drawing of flames rising to a point, with sparks flicking off to the sides.',
    obcImage: 'huo.png',
  },
  {
    char: '人',
    pinyin: 'rén',
    gloss: 'person; human',
    type: 'pictograph',
    origin:
      'A side view of a standing human being, showing the torso and a leg — a person ' +
      'seen in profile, bending slightly forward.',
    obcImage: 'ren.png',
  },
  {
    char: '目',
    pinyin: 'mù',
    gloss: 'eye',
    type: 'pictograph',
    origin:
      'A drawing of an eye with the pupil in the middle. Originally horizontal, it ' +
      'was rotated upright, which is why the modern form stands on end.',
    obcImage: 'mu_eye.png',
  },
  {
    char: '口',
    pinyin: 'kǒu',
    gloss: 'mouth; opening',
    type: 'pictograph',
    origin: 'A simple outline of an open mouth.',
    obcImage: 'kou.png',
  },
  {
    char: '手',
    pinyin: 'shǒu',
    gloss: 'hand',
    type: 'pictograph',
    origin: 'A drawing of a hand with the five fingers spread out from the wrist.',
    obcImage: 'shou.png',
  },
  {
    char: '雨',
    pinyin: 'yǔ',
    gloss: 'rain',
    type: 'pictograph',
    origin:
      'Drops of water falling from a line representing the sky (or a cloud). The dots ' +
      'inside the modern frame are the falling raindrops.',
    obcImage: 'yu.png',
  },
  {
    char: '明',
    pinyin: 'míng',
    gloss: 'bright; clear',
    type: 'compound',
    origin:
      'A compound of sun 日 and moon 月 placed together — the two brightest things in ' +
      'the sky combined to mean "bright".',
    obcImage: 'ming.png',
  },
]

// Quick lookup by character.
export const CHAR_INDEX = Object.fromEntries(CHARACTERS.map((c) => [c.char, c]))
