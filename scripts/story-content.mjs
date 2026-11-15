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
    product: '这就是 KhonsuGraph。为猎手而造。',
    hunters: [['威胁猎人', '追踪攻击路径与威胁。'], ['SRE', '追踪故障根因与依赖关系。'], ['欺诈调查员', '追踪异常交易与隐藏关联。'], ['研究者', '探索复杂网络中的模式。']],
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
    product: 'This is KhonsuGraph. Built for Hunters.',
    hunters: [['Threat hunters', 'Trace attack paths and threats.'], ['SREs', 'Trace root causes and dependencies.'], ['Fraud investigators', 'Trace anomalous transactions and hidden links.'], ['Researchers', 'Explore patterns in complex networks.']],
    read: 'Follow the story',
  },
  ja: {
    eyebrow: '探索の物語',
    title: '私たちはいつも、<br>隠れたつながりを探してきた。',
    intro: '未知を探る歴史は、手がかりを追う歴史でもあります。',
    labels: ['足跡', '月光', '星辰', '関係'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: '太古の荒野', title: '狩人は足跡を追った。', alt: '荒野で地面に残る動物の足跡をたどる狩人', paragraphs: ['地図のない荒野で、狩人は土に残った足跡、折れた枝、動物が残した痕跡を読み取ります。', 'ひとつの足跡だけでは、多くは語りません。しかし次の足跡へとつながると、その痕跡は道筋を浮かび上がらせます。動物がどこを通り、どこへ向かうのかがわかります。'], insight: '足跡をつなぐ。<br>そこに進むべき方向が見えてくる。' },
      { motif: 'MOONLIGHT → A WAY', era: '古代エジプト', title: '人々は月を見上げた。', alt: '黄金の月の下に立つ月神コンス、月光が川と遠くの都市を照らす', paragraphs: ['古代エジプト神話で、コンス（Khonsu）は月と旅と守護の神です。その名は「旅人」を意味し、月が夜空を旅する姿を表しています。', '日が沈むと、月光は暗闇を行く旅人に道を示します。'], insight: '暗闇は道がないという意味ではない。<br>ただ、その道がまだ見えていないだけだ。' },
      { motif: 'STARS → A CHART', era: '大航海時代', title: '探検家は星を追った。', alt: '六分儀を手に、金の星々の星座から海上の針路を定める航海者', paragraphs: ['香辛料と東への航路を求めて、航海者たちは未知の海へ乗り出しました。', '星の位置を読み、風向きや海流、航海記録と合わせて、広い海の上で進むべき方角を定めました。'], insight: 'ひとつの星は、ただの光の点にすぎない。<br>つながった星々は、針路を示す星図になる。' },
      { motif: 'SIGNALS → A STORY', era: '現在', title: 'デジタルの痕跡を追う。', alt: '画面の前で、金色につながるノードのネットワークを探索する現代の脅威ハンター', paragraphs: ['今日、脅威ハンターはデジタル世界の痕跡を追います。現代の闇は、膨大なデータの中に隠れています。', 'セキュリティアナリストはログから攻撃を再構成します。SRE はサービス間の依存をたどり、根本原因と影響範囲を特定します。監査担当者は取引とエンティティの関係を追い、異常とリスクを明らかにします。'], insight: '無関係に見える出来事、資産、アイデンティティも、<br>そのつながりの中に物語を現す。' }
    ],
    bridge: '荒野の足跡から夜空の星図へ、そしてデジタル世界の関係ネットワークへ。<br>私たちはずっと同じことをしてきました。',
    conclusion: '手がかりをつなぎ、真実を見つける。',
    product: 'それが KhonsuGraph。狩人たちのために。',
    hunters: [['脅威ハンター', '攻撃経路と脅威を追跡。'], ['SRE', '根本原因と依存関係を追跡。'], ['不正調査担当者', '異常な取引と隠れたつながりを追跡。'], ['研究者', '複雑なネットワークのパターンを探索。']],
    read: '物語をたどる',
  },
  ko: {
    eyebrow: '탐험의 이야기',
    title: '우리는 언제나<br>숨은 연결을 찾아왔습니다.',
    intro: '미지의 세계를 탐험한 역사는 곧 단서를 따라간 역사입니다.',
    labels: ['발자국', '달빛', '별', '관계'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: '고대의 야생', title: '사냥꾼은 발자국을 따라갔습니다.', alt: '야생에서 땅에 남은 동물의 발자국을 따라가는 사냥꾼', paragraphs: ['지도가 없는 야생에서 사냥꾼은 흙 위의 발자국과 부러진 가지, 동물이 남긴 흔적을 읽었습니다.', '발자국 하나만으로는 알 수 있는 것이 적습니다. 하지만 다음 발자국과 이어지면 그 흔적은 길을 드러냅니다. 동물이 어디를 지나 어디로 향하는지 알 수 있습니다.'], insight: '발자국을 연결하세요.<br>방향이 보이기 시작합니다.' },
      { motif: 'MOONLIGHT → A WAY', era: '고대 이집트', title: '사람들은 달을 올려다보았습니다.', alt: '황금빛 달 아래 서 있는 달의 신 콘수, 달빛이 강과 먼 도시를 비춥니다', paragraphs: ['고대 이집트 신화에서 콘수(Khonsu)는 달과 여행, 수호의 신입니다. 그 이름은 “여행자”를 뜻하며, 밤하늘을 여행하는 달의 모습을 담고 있습니다.', '해가 지면 달빛은 어둠 속 여행자에게 길을 보여 줍니다.'], insight: '어둠은 길이 없다는 뜻이 아닙니다.<br>다만 그 길을 아직 발견하지 못했을 뿐입니다.' },
      { motif: 'STARS → A CHART', era: '대항해 시대', title: '탐험가들은 별을 따라갔습니다.', alt: '육분의를 들고 황금빛 별자리로 바다 위 항로를 정하는 항해자', paragraphs: ['향신료와 동방으로 가는 항로를 찾아, 항해자들은 미지의 바다로 나아갔습니다.', '별의 위치를 읽고 바람과 해류, 항해 기록과 함께 살펴 넓은 바다에서 방향을 잡았습니다.'], insight: '홀로 있는 별은 빛의 점일 뿐입니다.<br>연결된 별들은 항로를 알려 주는 별자리가 됩니다.' },
      { motif: 'SIGNALS → A STORY', era: '오늘', title: '디지털 흔적을 따라갑니다.', alt: '화면 앞에서 황금빛으로 연결된 노드 네트워크를 탐색하는 현대의 위협 사냥꾼', paragraphs: ['오늘날 위협 사냥꾼은 디지털 세계의 흔적을 따라갑니다. 현대의 어둠은 방대한 데이터 속에 숨어 있습니다.', '보안 분석가는 로그에서 공격을 재구성합니다. SRE는 서비스 간 의존 관계를 추적해 근본 원인과 영향을 파악합니다. 감사자는 거래와 엔티티 관계를 따라가 이상 징후와 위험을 밝혀냅니다.'], insight: '관련 없어 보이는 사건과 자산, 아이덴티티도<br>연결 속에서 이야기를 드러냅니다.' }
    ],
    bridge: '야생의 발자국에서 밤하늘의 별자리로, 다시 디지털 세계의 관계망으로.<br>우리는 늘 같은 일을 해 왔습니다.',
    conclusion: '단서를 연결하고, 진실을 발견합니다.',
    product: '그것이 KhonsuGraph입니다. 사냥꾼을 위해 만들었습니다.',
    hunters: [['위협 사냥꾼', '공격 경로와 위협을 추적합니다.'], ['SRE', '근본 원인과 의존 관계를 추적합니다.'], ['사기 조사관', '이상 거래와 숨은 연결을 추적합니다.'], ['연구자', '복잡한 네트워크의 패턴을 탐색합니다.']],
    read: '이야기 따라가기',
  },
  fr: {
    eyebrow: 'UNE HISTOIRE D’EXPLORATION',
    title: 'Toujours en quête<br>des connexions cachées.',
    intro: 'L’histoire de l’exploration de l’inconnu est aussi une histoire de pistes suivies.',
    labels: ['Traces', 'Clair de lune', 'Étoiles', 'Connexions'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: 'LA NATURE SAUVAGE ANCIENNE', title: 'Les chasseurs suivaient les traces.', alt: 'Un chasseur suit des traces d’animaux dans la nature sauvage', paragraphs: ['Dans une nature sans cartes, les chasseurs lisaient les empreintes dans la terre, les branches brisées et les traces laissées par les animaux.', 'Une empreinte seule dit peu. Reliée à la suivante, elle révèle un chemin : par où l’animal est passé et où il pourrait aller.'], insight: 'Reliez les traces.<br>Une direction commence à apparaître.' },
      { motif: 'MOONLIGHT → A WAY', era: 'ÉGYPTE ANTIQUE', title: 'Les voyageurs levaient les yeux vers la lune.', alt: 'Khonsu sous une lune dorée, son clair de lune éclairant un fleuve et une ville lointaine', paragraphs: ['Dans la mythologie égyptienne, Khonsu est le dieu de la lune, du voyage et de la protection. Son nom signifie « voyageur », évoquant le périple de la lune dans le ciel nocturne.', 'Quand le soleil se couche, le clair de lune montre aux voyageurs un chemin dans l’obscurité.'], insight: 'L’obscurité ne signifie pas qu’il n’y a pas de chemin.<br>Seulement qu’il reste à trouver.' },
      { motif: 'STARS → A CHART', era: 'L’ÈRE DES GRANDES DÉCOUVERTES', title: 'Les explorateurs suivaient les étoiles.', alt: 'Un navigateur utilise un sextant et une constellation d’étoiles dorées pour trouver sa route en mer', paragraphs: ['En quête d’épices et de routes maritimes vers l’Est, les navigateurs s’aventuraient dans des eaux inconnues.', 'Ils lisaient la position des étoiles avec les vents, les courants et les carnets de voyage pour s’orienter en pleine mer.'], insight: 'Une étoile isolée n’est qu’un point de lumière.<br>Reliées, les étoiles deviennent une carte pour naviguer.' },
      { motif: 'SIGNALS → A STORY', era: 'AUJOURD’HUI', title: 'Nous suivons les traces numériques.', alt: 'Un chasseur de menaces moderne explore un réseau de nœuds dorés connectés sur un écran', paragraphs: ['Aujourd’hui, les chasseurs de menaces suivent des traces dans le monde numérique. Son obscurité se cache dans des masses de données.', 'Les analystes de sécurité reconstituent les attaques à partir des journaux. Les SRE tracent les dépendances entre services pour localiser les causes racines et comprendre leur impact. Les auditeurs suivent les transactions et les relations entre entités pour révéler anomalies et risques.'], insight: 'Des événements, des actifs et des identités apparemment sans lien<br>révèlent leur histoire à travers leurs connexions.' }
    ],
    bridge: 'Des traces dans la nature aux cartes du ciel nocturne, puis aux réseaux de relations numériques,<br>nous avons toujours fait la même chose :',
    conclusion: 'Relier les indices. Trouver la vérité.',
    product: 'C’est KhonsuGraph. Conçu pour les chasseurs.',
    hunters: [['Chasseurs de menaces', 'Tracer les chemins d’attaque et les menaces.'], ['SRE', 'Tracer les causes racines et les dépendances.'], ['Enquêteurs fraude', 'Tracer les transactions anormales et les liens cachés.'], ['Chercheurs', 'Explorer les motifs des réseaux complexes.']],
    read: 'Suivre l’histoire',
  },
  de: {
    eyebrow: 'EINE GESCHICHTE DER ERKUNDUNG',
    title: 'Immer auf der Suche<br>nach verborgenen Verbindungen.',
    intro: 'Die Geschichte der Erforschung des Unbekannten ist auch eine Geschichte des Spurenlesens.',
    labels: ['Spuren', 'Mondlicht', 'Sterne', 'Verbindungen'],
    chapters: [
      { motif: 'TRACKS → A PATH', era: 'DIE ALTE WILDNIS', title: 'Jäger folgten Spuren.', alt: 'Ein Jäger folgt Tierspuren durch die Wildnis', paragraphs: ['In einer Wildnis ohne Karten lasen Jäger Fußabdrücke im Boden, abgebrochene Zweige und Spuren, die Tiere hinterlassen hatten.', 'Ein einzelner Fußabdruck sagt wenig. Mit dem nächsten verbunden, offenbaren die Spuren einen Weg: wo ein Tier gewesen ist und wohin es gehen könnte.'], insight: 'Verbinden Sie die Spuren.<br>Eine Richtung beginnt sich abzuzeichnen.' },
      { motif: 'MOONLIGHT → A WAY', era: 'DAS ALTE ÄGYPTEN', title: 'Reisende blickten zum Mond.', alt: 'Khonsu unter einem goldenen Mond, dessen Licht einen Fluss und eine ferne Stadt erhellt', paragraphs: ['In der altägyptischen Mythologie ist Khonsu der Gott des Mondes, der Reise und des Schutzes. Sein Name bedeutet „Reisender“ und erinnert an die Reise des Mondes über den Nachthimmel.', 'Wenn die Sonne untergeht, zeigt das Mondlicht Reisenden einen Weg durch die Dunkelheit.'], insight: 'Dunkelheit heißt nicht, dass es keinen Weg gibt.<br>Nur, dass er noch gefunden werden muss.' },
      { motif: 'STARS → A CHART', era: 'DAS ZEITALTER DER ENTDECKUNGEN', title: 'Entdecker folgten den Sternen.', alt: 'Ein Navigator bestimmt mit einem Sextanten und einem Sternbild goldener Sterne den Kurs auf See', paragraphs: ['Auf der Suche nach Gewürzen und Seewegen nach Osten segelten Navigatoren in unbekannte Gewässer.', 'Sie lasen die Positionen der Sterne zusammen mit Winden, Strömungen und Reiseaufzeichnungen, um auf offener See ihren Kurs zu finden.'], insight: 'Ein einzelner Stern ist nur ein Lichtpunkt.<br>Verbunden werden Sterne zu einer Karte, nach der man navigiert.' },
      { motif: 'SIGNALS → A STORY', era: 'HEUTE', title: 'Wir folgen digitalen Spuren.', alt: 'Ein moderner Threat Hunter erkundet auf einem Bildschirm ein Netzwerk verbundener goldener Knoten', paragraphs: ['Heute folgen Threat Hunter Spuren durch die digitale Welt. Ihre Dunkelheit verbirgt sich in gewaltigen Datenmengen.', 'Sicherheitsanalysten rekonstruieren Angriffe aus Protokollen. SREs verfolgen Dienstabhängigkeiten, um Ursachen zu finden und ihre Auswirkungen zu verstehen. Prüfer folgen Transaktionen und Beziehungen zwischen Entitäten, um Anomalien und Risiken aufzudecken.'], insight: 'Scheinbar unverbundene Ereignisse, Assets und Identitäten<br>offenbaren ihre Geschichte durch ihre Verbindungen.' }
    ],
    bridge: 'Von Spuren in der Wildnis über Karten des Nachthimmels bis zu Netzwerken digitaler Beziehungen –<br>haben wir immer dasselbe getan:',
    conclusion: 'Hinweise verbinden. Die Wahrheit finden.',
    product: 'Das ist KhonsuGraph. Für Jäger gebaut.',
    hunters: [['Threat Hunter', 'Angriffspfade und Bedrohungen verfolgen.'], ['SREs', 'Ursachen und Abhängigkeiten nachverfolgen.'], ['Betrugsermittler', 'Auffällige Transaktionen und versteckte Verbindungen verfolgen.'], ['Forschende', 'Muster in komplexen Netzwerken erkunden.']],
    read: 'Der Geschichte folgen',
  }
};
