// The original four-panel artwork is displayed through four SVG viewports.
// The source bitmap is preserved; each viewport excludes the collage gutters.
export const artwork = (panel, label, className = '') => {
  const views = ['17 21 744 478', '774 16 745 483', '17 514 744 484', '774 513 745 485'];
  return `<svg class="story-art ${className}" viewBox="${views[panel]}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><image href="/assets/exploration-story.webp" width="1536" height="1024"/></svg>`;
};

export const stories = {
  zh: {
    eyebrow: '一段关于探索的故事',
    title: '我们始终在寻找，<br>那些隐藏的联系。',
    intro: '人类探索未知的历史，也是一部追踪线索的历史。',
    labels: ['足迹', '月光', '星辰', '关系'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: '远古时代', title: '猎人追踪足迹。', alt: '荒野中的猎人沿着地上的足迹寻找猎物', paragraphs: ['在没有地图的荒野中，猎人观察泥土上的脚印、折断的树枝和动物留下的痕迹。', '单个足迹无法说明什么。但当足迹彼此连接，便能还原猎物的行动轨迹，推断它的去向。'], insight: '当足迹彼此连接，方向开始显现。' },
      { motif: 'MOONLIGHT → A WAY', era: '古埃及时期', title: '人们仰望月亮。', alt: '月神 Khonsu 站在月光下，金色的月亮照亮河流与远方的城市', paragraphs: ['在古埃及神话中，Khonsu 是月亮、旅行与守护之神。他的名字意为“旅行者”，象征着月亮穿越夜空的旅程。', '当太阳落下，月光为黑暗中的旅行者照亮前路。'], insight: '黑暗并不意味着没有道路，<br>只是道路尚未被发现。' },
      { motif: 'STARS → A CHART', era: '大航海时代', title: '探险者追随星辰。', alt: '航海者手持六分仪，以连成星图的金色星辰确定航向', paragraphs: ['为了寻找香料与通往东方的航路，航海者驶向未知的海洋。', '他们观察星辰的位置，结合风向、洋流与航海记录，在浩瀚海面上确定方向。'], insight: '孤立的星辰只是光点。<br>当它们被联系起来，便成为指引航程的星图。' },
      { motif: 'SIGNALS → A STORY', era: '今天', title: '追踪数字世界的痕迹。', alt: '现代威胁猎人在屏幕前探索相互连接的金色节点', paragraphs: ['今天，威胁猎人追踪数字世界的痕迹。现代世界的黑暗隐藏在海量数据之中。', '安全分析师追踪攻击者留下的日志，重建完整的攻击路径。SRE 追踪服务之间的依赖，定位故障根因与影响范围。审计人员追踪交易与实体关系，揭示隐藏的异常和风险。'], insight: '看似无关的事件、资产与身份，<br>在关系中逐渐显现出完整的脉络。' }
    ],
    bridge: '从荒野中的足迹，到夜空中的星图，再到数字世界的关系网络，<br>人类始终在做同一件事：',
    conclusion: '连接线索，发现真相。',
    product: '这就是 Khonsu Graph。',
    description: '一个面向人与 AI 协作的本地图分析工作空间，让复杂的关系变得可见，让隐藏的威胁有迹可循。',
    read: '沿着故事探索',
  },
  en: {
    eyebrow: 'A STORY OF EXPLORATION',
    title: 'Always searching for<br>the hidden connections.',
    intro: 'The history of exploring the unknown is also a history of following traces.',
    labels: ['Tracks', 'Moonlight', 'Stars', 'Connections'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: 'THE ANCIENT WILDERNESS', title: 'Hunters followed tracks.', alt: 'A hunter follows animal tracks through the wilderness', paragraphs: ['In a wilderness without maps, hunters read footprints in the soil, broken branches, and traces left by animals.', 'One footprint tells little. Connected to the next, those traces reveal a path — where an animal has been, and where it might go.'], insight: 'Connect the tracks.<br>A direction begins to emerge.' },
      { motif: 'MOONLIGHT → A WAY', era: 'ANCIENT EGYPT', title: 'Travelers looked to the moon.', alt: 'Khonsu beneath a golden moon, with moonlight illuminating a river and distant city', paragraphs: ['In ancient Egyptian mythology, Khonsu is the god of the moon, travel, and protection. His name means “traveler,” evoking the moon’s journey across the night sky.', 'When the sun sets, moonlight shows travelers a way through the darkness.'], insight: 'Darkness does not mean there is no path.<br>Only that the path is yet to be found.' },
      { motif: 'STARS → A CHART', era: 'THE AGE OF EXPLORATION', title: 'Explorers followed the stars.', alt: 'A navigator uses a sextant and a constellation of golden stars to find a course at sea', paragraphs: ['Seeking spices and sea routes to the East, navigators sailed into unknown waters.', 'They read the positions of stars alongside winds, currents, and voyage records to find their bearings on the open ocean.'], insight: 'A lone star is a point of light.<br>Connected, stars become a chart to navigate by.' },
      { motif: 'SIGNALS → A STORY', era: 'TODAY', title: 'We follow digital traces.', alt: 'A modern threat hunter explores a network of connected golden nodes on a screen', paragraphs: ['Today, threat hunters follow traces through the digital world. Its darkness hides in vast amounts of data.', 'Security analysts reconstruct attacks from logs. SREs trace service dependencies to locate root causes and understand their impact. Auditors follow transactions and entity relationships to uncover anomalies and risk.'], insight: 'Seemingly unrelated events, assets, and identities<br>reveal their story through their connections.' }
    ],
    bridge: 'From tracks in the wilderness to charts of the night sky and networks of digital relationships,<br>we have always been doing the same thing:',
    conclusion: 'Connecting clues. Finding the truth.',
    product: 'This is Khonsu Graph.',
    description: 'A local graph analysis workspace for people and AI. Make complex relationships visible, and hidden threats traceable.',
    read: 'Follow the story',
  }
};
