export interface SubjectData {
  name: string;
  slug: string;
  shortName: string;
  description: string;
  examDescription: string;
  keyTopics: string[];
  examFormat: string;
  examDuration: string;
  units: number;
  difficulty: 'Moderate' | 'Hard' | 'Very Hard';
}

export const SUBJECT_DATA: Record<string, SubjectData> = {
  'ap-biology': {
    name: 'AP Biology',
    slug: 'ap-biology',
    shortName: 'Biology',
    description:
      'AP Biology explores life at all scales — from molecular interactions inside cells to ecological relationships among organisms. Students investigate core biological principles through inquiry-based lab work and data analysis.',
    examDescription:
      'The AP Biology exam tests conceptual understanding and scientific practices across 8 units, from the chemistry of life to ecology. It includes 60 multiple-choice and 6 free-response questions.',
    keyTopics: [
      'Chemistry of Life & Cellular Structure',
      'DNA Replication & Gene Expression',
      'Cell Energetics (Photosynthesis & Cellular Respiration)',
      'Cell Communication & Cell Cycle',
      'Heredity & Mendelian Genetics',
      'Gene Expression & Regulation',
      'Natural Selection & Evolution',
      'Ecology & Ecosystems',
    ],
    examFormat: '60 multiple choice + 6 free-response questions',
    examDuration: '3 hours 15 minutes',
    units: 8,
    difficulty: 'Hard',
  },
  'ap-chemistry': {
    name: 'AP Chemistry',
    slug: 'ap-chemistry',
    shortName: 'Chemistry',
    description:
      'AP Chemistry develops deep understanding of the composition, properties, and reactions of matter. Students engage in laboratory investigations and apply mathematical reasoning to chemical concepts.',
    examDescription:
      'The AP Chemistry exam assesses understanding of atomic structure, chemical bonding, thermodynamics, and reaction kinetics across 9 units.',
    keyTopics: [
      'Atomic Structure & Properties',
      'Molecular & Ionic Compound Bonding',
      'Intermolecular Forces & Properties',
      'Chemical Reactions & Stoichiometry',
      'Kinetics & Reaction Rates',
      'Thermodynamics & Energy',
      "Equilibrium & Le Chatelier's Principle",
      'Acids, Bases & pH',
      'Electrochemistry',
    ],
    examFormat: '60 multiple choice + 7 free-response questions',
    examDuration: '3 hours 15 minutes',
    units: 9,
    difficulty: 'Very Hard',
  },
  'ap-physics-1': {
    name: 'AP Physics 1',
    slug: 'ap-physics-1',
    shortName: 'Physics 1',
    description:
      'AP Physics 1 is an algebra-based course covering Newtonian mechanics, work, energy, waves, and electric charge. It emphasizes scientific reasoning and inquiry through laboratory investigations.',
    examDescription:
      'The AP Physics 1 exam evaluates conceptual understanding of mechanics, waves, and electricity through multi-select and free-response questions.',
    keyTopics: [
      'Kinematics & Projectile Motion',
      "Forces & Newton's Laws",
      'Work, Energy & Power',
      'Systems of Particles & Linear Momentum',
      'Torque, Rotational Motion & Angular Momentum',
      'Electric Charge & Electric Force',
      'DC Circuits',
      'Mechanical Waves & Sound',
    ],
    examFormat: '50 multiple choice + 5 free-response questions',
    examDuration: '3 hours',
    units: 8,
    difficulty: 'Hard',
  },
  'ap-physics-2': {
    name: 'AP Physics 2',
    slug: 'ap-physics-2',
    shortName: 'Physics 2',
    description:
      'AP Physics 2 is an algebra-based course covering fluid mechanics, thermodynamics, electricity, magnetism, optics, and modern physics. It builds on Physics 1 with more advanced applications.',
    examDescription:
      'The AP Physics 2 exam tests understanding of fluids, thermodynamics, electrostatics, magnetic fields, geometric optics, and quantum physics.',
    keyTopics: [
      'Fluids & Pressure',
      'Thermodynamics & Heat Engines',
      'Electric Force & Electric Field',
      'Electric Potential & Capacitors',
      'Electric Circuits & Magnetism',
      'Electromagnetic Induction',
      'Geometric & Physical Optics',
      'Quantum & Nuclear Physics',
    ],
    examFormat: '50 multiple choice + 4 free-response questions',
    examDuration: '3 hours',
    units: 8,
    difficulty: 'Hard',
  },
  'ap-physics-c': {
    name: 'AP Physics C',
    slug: 'ap-physics-c',
    shortName: 'Physics C',
    description:
      'AP Physics C uses calculus to study Newtonian mechanics and electromagnetism at a university level. It is one of the most rigorous AP science courses, designed for students pursuing STEM careers.',
    examDescription:
      'AP Physics C consists of two separate exams — Mechanics and Electricity & Magnetism — each requiring calculus-based reasoning.',
    keyTopics: [
      "Kinematics & Newton's Laws (Calculus-based)",
      'Work, Energy & Power (Calculus-based)',
      'Systems of Particles & Linear Momentum',
      'Rotation & Angular Momentum',
      'Oscillations & Gravity',
      "Electrostatics & Gauss's Law",
      'Conductors, Capacitors & Dielectrics',
      'Magnetic Fields & Electromagnetic Induction',
    ],
    examFormat: '35 multiple choice + 3 free-response questions (per exam)',
    examDuration: '1 hour 30 minutes (per exam)',
    units: 5,
    difficulty: 'Very Hard',
  },
  'ap-calculus-ab': {
    name: 'AP Calculus AB',
    slug: 'ap-calculus-ab',
    shortName: 'Calculus AB',
    description:
      'AP Calculus AB introduces differential and integral calculus, covering limits, derivatives, and integrals with applications. It is equivalent to one semester of college calculus.',
    examDescription:
      'The AP Calculus AB exam tests knowledge of limits, differentiation, integration, and their real-world applications across 8 units.',
    keyTopics: [
      'Limits & Continuity',
      'Differentiation: Definition & Fundamental Properties',
      'Differentiation: Composite, Implicit & Inverse Functions',
      'Contextual Applications of Differentiation',
      'Analytical Applications of Differentiation (MVT, Optimization)',
      'Integration & Accumulation of Change',
      'Differential Equations',
      'Applications of Integration (Area, Volume)',
    ],
    examFormat: '45 multiple choice + 6 free-response questions',
    examDuration: '3 hours 15 minutes',
    units: 8,
    difficulty: 'Hard',
  },
  'ap-calculus-bc': {
    name: 'AP Calculus BC',
    slug: 'ap-calculus-bc',
    shortName: 'Calculus BC',
    description:
      'AP Calculus BC covers all Calculus AB topics plus additional material including sequences, series, polar coordinates, and parametric equations. It is equivalent to two semesters of college calculus.',
    examDescription:
      'The AP Calculus BC exam includes all AB content plus infinite series, polar curves, and vector functions.',
    keyTopics: [
      'All AP Calculus AB Topics',
      'Parametric Equations & Vector-Valued Functions',
      'Polar Coordinates & Curves',
      'Sequences & Infinite Series',
      'Taylor & Maclaurin Series',
      'Convergence Tests (Ratio, Integral, Comparison)',
      'Advanced Integration Techniques',
      'Logistic Growth & Differential Equations',
    ],
    examFormat: '45 multiple choice + 6 free-response questions',
    examDuration: '3 hours 15 minutes',
    units: 10,
    difficulty: 'Very Hard',
  },
  'ap-statistics': {
    name: 'AP Statistics',
    slug: 'ap-statistics',
    shortName: 'Statistics',
    description:
      'AP Statistics introduces statistical thinking, data analysis, probability, and inference. Students learn to design studies, explore data, and draw conclusions using real-world datasets.',
    examDescription:
      'The AP Statistics exam evaluates skills in exploring data, sampling, probability, and statistical inference across 9 units.',
    keyTopics: [
      'Exploring One-Variable Data',
      'Exploring Two-Variable Data',
      'Collecting Data (Sampling & Experiments)',
      'Probability & Randomness',
      'Sampling Distributions',
      'Inference for Categorical Data (Chi-Square)',
      'Inference for Quantitative Data (t-tests)',
      'Inference for Regression',
      'Confidence Intervals',
    ],
    examFormat: '40 multiple choice + 6 free-response questions',
    examDuration: '3 hours',
    units: 9,
    difficulty: 'Moderate',
  },
  'ap-computer-science-a': {
    name: 'AP Computer Science A',
    slug: 'ap-computer-science-a',
    shortName: 'CS A',
    description:
      'AP Computer Science A teaches object-oriented programming and problem solving using Java. Students learn core programming concepts, algorithms, and data structures used in professional software development.',
    examDescription:
      'The AP CS A exam tests Java programming skills including classes, inheritance, arrays, ArrayLists, and 2D arrays.',
    keyTopics: [
      'Primitive Types & Variables',
      'Using Objects & String Methods',
      'Boolean Expressions & Conditionals',
      'Iteration (for/while loops)',
      'Writing Classes & Object-Oriented Design',
      'Arrays & 2D Arrays',
      'ArrayList & Array Manipulation',
      'Inheritance & Polymorphism',
      'Recursion',
    ],
    examFormat: '40 multiple choice + 4 free-response questions',
    examDuration: '3 hours',
    units: 10,
    difficulty: 'Moderate',
  },
  'ap-computer-science-principles': {
    name: 'AP Computer Science Principles',
    slug: 'ap-computer-science-principles',
    shortName: 'CS Principles',
    description:
      'AP Computer Science Principles introduces foundational concepts of computer science and how computing transforms society. Students explore creative programming, data analysis, and the internet.',
    examDescription:
      'The AP CSP assessment combines a through-course Create performance task with an end-of-course exam covering digital information, the internet, algorithms, and impacts of computing.',
    keyTopics: [
      'Digital Information & Binary',
      'Internet Architecture & Protocols',
      'Algorithms & Programming Logic',
      'Variables, Conditionals & Iteration',
      'Procedures & Lists',
      'Simulations & Data Analysis',
      'Cybersecurity & Data Privacy',
      'Impacts of Computing on Society',
    ],
    examFormat: '70 multiple choice + Create Performance Task (25% of score)',
    examDuration: '2 hours (exam portion)',
    units: 5,
    difficulty: 'Moderate',
  },
  'ap-english-language': {
    name: 'AP English Language',
    slug: 'ap-english-language',
    shortName: 'English Language',
    description:
      'AP English Language and Composition develops skills in reading and analyzing nonfiction texts and crafting rhetorically effective arguments. Students study rhetoric, persuasion, and the art of clear writing.',
    examDescription:
      'The AP English Language exam tests rhetorical analysis, synthesis, and argumentation through multiple-choice reading and three free-response writing tasks.',
    keyTopics: [
      'Rhetorical Situation & Purpose',
      'Claims, Evidence & Commentary',
      'Reasoning & Organization',
      'Style & Tone in Argumentation',
      'Synthesizing Multiple Sources',
      'Rhetorical Analysis of Nonfiction',
      'Effective Argumentation',
      'Grammar, Syntax & Diction for Effect',
    ],
    examFormat: '45 multiple choice + 3 free-response essays',
    examDuration: '3 hours 15 minutes',
    units: 9,
    difficulty: 'Moderate',
  },
  'ap-english-literature': {
    name: 'AP English Literature',
    slug: 'ap-english-literature',
    shortName: 'English Literature',
    description:
      'AP English Literature and Composition focuses on careful reading and analysis of literary texts including prose fiction, poetry, and drama. Students develop skills in literary interpretation and critical essay writing.',
    examDescription:
      'The AP English Literature exam assesses literary analysis through multiple-choice reading questions and three free-response essays on poetry, prose, and literary argumentation.',
    keyTopics: [
      'Short Fiction & Narrative Structure',
      'Poetry Analysis (imagery, tone, form)',
      'Longer Fiction & Drama',
      'Character & Characterization',
      'Setting & its Significance',
      'Figurative Language & Literary Devices',
      'Theme & Authorial Purpose',
      'Literary Argument & Evidence',
    ],
    examFormat: '55 multiple choice + 3 free-response essays',
    examDuration: '3 hours',
    units: 9,
    difficulty: 'Moderate',
  },
  'ap-us-history': {
    name: 'AP US History',
    slug: 'ap-us-history',
    shortName: 'US History',
    description:
      'AP US History traces the development of American society from pre-Columbian civilizations to the present day. Students develop skills in historical reasoning, evidence analysis, and argumentation.',
    examDescription:
      'The AP US History exam tests historical thinking skills and content knowledge across 9 periods using document-based and long essay questions.',
    keyTopics: [
      'Colonial America & European Contact (1491–1607)',
      'British Colonial America (1607–1754)',
      'American Revolution & New Nation (1754–1800)',
      'Antebellum Period & Expansion (1800–1848)',
      'Civil War & Reconstruction (1844–1877)',
      'Industrialization & Gilded Age (1865–1898)',
      'Imperialism & Progressive Era (1890–1920)',
      'Great Depression, WWII & Cold War (1920–1980)',
      'Contemporary America (1980–Present)',
    ],
    examFormat: '55 multiple choice + 3 short-answer + 1 DBQ + 1 long essay',
    examDuration: '3 hours 15 minutes',
    units: 9,
    difficulty: 'Hard',
  },
  'ap-world-history': {
    name: 'AP World History',
    slug: 'ap-world-history',
    shortName: 'World History',
    description:
      'AP World History: Modern examines global processes and contacts from 1200 CE to the present. Students develop skills in causation, comparison, and contextualization across civilizations and time periods.',
    examDescription:
      'The AP World History exam tests historical reasoning and content knowledge across 9 units spanning 1200 CE to the present day.',
    keyTopics: [
      'The Global Tapestry (1200–1450)',
      'Networks of Exchange (1200–1450)',
      'Land-Based Empires (1450–1750)',
      'Transoceanic Interconnections (1450–1750)',
      'Revolutions & Industrialization (1750–1900)',
      'Consequences of Industrialization (1750–1900)',
      'Global Conflict (1900–Present)',
      'Cold War & Decolonization (1900–Present)',
      'Globalization (1900–Present)',
    ],
    examFormat: '55 multiple choice + 3 short-answer + 1 DBQ + 1 long essay',
    examDuration: '3 hours 15 minutes',
    units: 9,
    difficulty: 'Hard',
  },
  'ap-european-history': {
    name: 'AP European History',
    slug: 'ap-european-history',
    shortName: 'European History',
    description:
      'AP European History traces European development from 1450 to the present, covering the Renaissance through contemporary Europe. Students analyze political, economic, social, and cultural transformations.',
    examDescription:
      'The AP European History exam tests historical reasoning and content knowledge across 4 periods from the Renaissance to the present.',
    keyTopics: [
      'Renaissance & Reformation (1450–1648)',
      'Scientific Revolution & Enlightenment',
      'Absolute Monarchy & Balance of Power (1648–1815)',
      'French Revolution & Napoleon',
      'Industrialization & 19th Century Politics (1815–1914)',
      'Nationalism & Imperialism',
      'World Wars & Interwar Period (1914–1945)',
      'Cold War & European Integration (1945–Present)',
    ],
    examFormat: '55 multiple choice + 3 short-answer + 1 DBQ + 1 long essay',
    examDuration: '3 hours 15 minutes',
    units: 8,
    difficulty: 'Hard',
  },
  'ap-government': {
    name: 'AP Government',
    slug: 'ap-government',
    shortName: 'Government',
    description:
      'AP United States Government and Politics examines the organization and operation of American government. Students analyze the Constitution, political behavior, institutions, and policy-making processes.',
    examDescription:
      'The AP Government exam covers foundational documents, civil liberties, political participation, government institutions, and policy.',
    keyTopics: [
      'Foundations of American Democracy',
      'Interactions Among Branches of Government',
      'Civil Liberties & Civil Rights',
      'American Political Ideologies & Beliefs',
      'Political Participation & Voting',
      'Congress & Legislative Process',
      'The Presidency & Executive Power',
      'The Judiciary & Constitutional Interpretation',
    ],
    examFormat: '55 multiple choice + 4 free-response questions',
    examDuration: '3 hours',
    units: 5,
    difficulty: 'Moderate',
  },
  'ap-economics': {
    name: 'AP Economics',
    slug: 'ap-economics',
    shortName: 'Economics',
    description:
      'AP Economics encompasses both Microeconomics and Macroeconomics. Micro covers supply/demand and market structures; Macro covers national income, fiscal policy, monetary policy, and international trade.',
    examDescription:
      'AP Micro and Macro each have separate 2-hour 10-minute exams testing economic reasoning, graphical analysis, and policy applications.',
    keyTopics: [
      'Supply & Demand (Micro)',
      'Consumer & Producer Theory (Micro)',
      'Market Structures: Competition to Monopoly (Micro)',
      'Factor Markets & Income Distribution (Micro)',
      'National Income Accounting & GDP (Macro)',
      'Aggregate Supply & Aggregate Demand (Macro)',
      'Fiscal Policy & Government Spending (Macro)',
      'Money, Banking & Monetary Policy (Macro)',
    ],
    examFormat: '60 multiple choice + 3 free-response questions (per exam)',
    examDuration: '2 hours 10 minutes (per exam)',
    units: 6,
    difficulty: 'Moderate',
  },
  'ap-psychology': {
    name: 'AP Psychology',
    slug: 'ap-psychology',
    shortName: 'Psychology',
    description:
      'AP Psychology introduces the scientific study of behavior and mental processes. Students explore biological bases of behavior, sensation, perception, cognition, motivation, emotion, and social psychology.',
    examDescription:
      'The AP Psychology exam tests knowledge and application of psychological concepts, theories, and research methods across 9 units.',
    keyTopics: [
      'History & Approaches to Psychology',
      'Research Methods & Statistics',
      'Biological Bases of Behavior',
      'Sensation & Perception',
      'States of Consciousness & Sleep',
      'Learning & Conditioning',
      'Memory & Cognition',
      'Motivation, Emotion & Stress',
      'Social Psychology',
    ],
    examFormat: '100 multiple choice + 2 free-response questions',
    examDuration: '2 hours',
    units: 9,
    difficulty: 'Moderate',
  },
  'ap-human-geography': {
    name: 'AP Human Geography',
    slug: 'ap-human-geography',
    shortName: 'Human Geography',
    description:
      "AP Human Geography explores patterns and processes that shape human understanding, use, and alteration of Earth's surface. Students analyze population, culture, economy, and political geography.",
    examDescription:
      'The AP Human Geography exam tests geographic concepts and skills across 7 units covering spatial thinking, population, culture, and globalization.',
    keyTopics: [
      'Geographic Perspectives & Maps',
      'Population & Migration',
      'Cultural Patterns & Processes',
      'Political Organization of Space',
      'Agricultural & Rural Land Use',
      'Industrialization & Economic Development',
      'Cities, Urban Land Use & Globalization',
    ],
    examFormat: '60 multiple choice + 3 free-response questions',
    examDuration: '2 hours 15 minutes',
    units: 7,
    difficulty: 'Moderate',
  },
  'ap-environmental-science': {
    name: 'AP Environmental Science',
    slug: 'ap-environmental-science',
    shortName: 'Environmental Science',
    description:
      'AP Environmental Science provides students with the scientific principles and concepts to understand the interrelationships of the natural world. Students analyze human impacts on the environment and evaluate solutions.',
    examDescription:
      'The AP Environmental Science exam tests understanding of Earth systems, biodiversity, populations, land and water use, energy, and environmental issues.',
    keyTopics: [
      'Earth Systems & Resources',
      'The Living World & Ecosystems',
      'Populations & Carrying Capacity',
      'Earth & Land Resources',
      'Water & Marine Resources',
      'Energy Resources & Consumption',
      'Atmospheric Pollution & Climate Change',
      'Aquatic & Terrestrial Pollution',
    ],
    examFormat: '80 multiple choice + 3 free-response questions',
    examDuration: '2 hours 40 minutes',
    units: 9,
    difficulty: 'Moderate',
  },
};

export function getSubjectBySlug(slug: string): SubjectData | undefined {
  return SUBJECT_DATA[slug];
}

export function getAllSubjectSlugs(): string[] {
  return Object.keys(SUBJECT_DATA);
}
