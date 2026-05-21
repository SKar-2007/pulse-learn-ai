// The 20 questions for the MBTI test
export const MBTI_QUESTIONS = [
    // E/I Dimension (Questions 1–5)
    {
        id: 1, dimension: 'EI',
        question: "At the end of a long study day, you feel more recharged by:",
        optionA: { label: "Discussing what you learned with someone", direction: 'E' },
        optionB: { label: "Quietly reflecting on it alone", direction: 'I' },
    },
    {
        id: 2, dimension: 'EI',
        question: "When starting a new topic, you prefer to:",
        optionA: { label: "Jump in and discuss it with others to understand it", direction: 'E' },
        optionB: { label: "Read and think through it deeply before discussing", direction: 'I' },
    },
    {
        id: 3, dimension: 'EI',
        question: "During a group study session, you typically:",
        optionA: { label: "Drive the conversation and think out loud", direction: 'E' },
        optionB: { label: "Listen carefully and contribute when you've processed", direction: 'I' },
    },
    {
        id: 4, dimension: 'EI',
        question: "You learn faster when:",
        optionA: { label: "You can talk through the concept with someone", direction: 'E' },
        optionB: { label: "You have uninterrupted time to work through it yourself", direction: 'I' },
    },
    {
        id: 5, dimension: 'EI',
        question: "After a quiz you did poorly on, you'd rather:",
        optionA: { label: "Talk it through with a peer immediately", direction: 'E' },
        optionB: { label: "Review it alone and figure out what went wrong", direction: 'I' },
    },
    // S/N Dimension (Questions 6–10)
    {
        id: 6, dimension: 'SN',
        question: "When learning a new concept, you want to start with:",
        optionA: { label: "The big picture — how it fits into the broader field", direction: 'N' },
        optionB: { label: "The specific facts and step-by-step details", direction: 'S' },
    },
    {
        id: 7, dimension: 'SN',
        question: "You trust knowledge more when it comes from:",
        optionA: { label: "Theory, patterns, and logical frameworks", direction: 'N' },
        optionB: { label: "Proven examples, data, and real-world applications", direction: 'S' },
    },
    {
        id: 8, dimension: 'SN',
        question: "A great explanation for you is one that:",
        optionA: { label: "Shows you WHY something works — the underlying principle", direction: 'N' },
        optionB: { label: "Shows you HOW it works — the exact mechanics", direction: 'S' },
    },
    {
        id: 9, dimension: 'SN',
        question: "You are more likely to remember something if:",
        optionA: { label: "You understand the conceptual model behind it", direction: 'N' },
        optionB: { label: "You practiced it through concrete repetition", direction: 'S' },
    },
    {
        id: 10, dimension: 'SN',
        question: "Your notes tend to look more like:",
        optionA: { label: "Mind maps, connections, and speculative ideas", direction: 'N' },
        optionB: { label: "Organized lists, bullet points, and verbatim facts", direction: 'S' },
    },
    // T/F Dimension (Questions 11–15)
    {
        id: 11, dimension: 'TF',
        question: "When a tutor corrects you, the most useful feedback is:",
        optionA: { label: "An honest analysis of exactly where your logic broke down", direction: 'T' },
        optionB: { label: "Encouragement alongside specific guidance on what to improve", direction: 'F' },
    },
    {
        id: 12, dimension: 'TF',
        question: "You choose to study a topic because:",
        optionA: { label: "It makes logical sense and leads to clear outcomes", direction: 'T' },
        optionB: { label: "You are personally drawn to it or it matters to you deeply", direction: 'F' },
    },
    {
        id: 13, dimension: 'TF',
        question: "When you get a low quiz score, you feel motivated by:",
        optionA: { label: "A precise breakdown of the error — no sugarcoating", direction: 'T' },
        optionB: { label: "Reassurance that the gap is fixable, with a clear path forward", direction: 'F' },
    },
    {
        id: 14, dimension: 'TF',
        question: "In collaborative learning, you contribute most by:",
        optionA: { label: "Critiquing ideas rigorously to make them stronger", direction: 'T' },
        optionB: { label: "Supporting teammates and keeping the energy positive", direction: 'F' },
    },
    {
        id: 15, dimension: 'TF',
        question: "An ideal course curriculum would be:",
        optionA: { label: "Logically structured with clear cause-and-effect between topics", direction: 'T' },
        optionB: { label: "Connected to real human stories and meaningful real-world impact", direction: 'F' },
    },
    // J/P Dimension (Questions 16–20)
    {
        id: 16, dimension: 'JP',
        question: "Your ideal study plan is:",
        optionA: { label: "Flexible — I explore what interests me and adapt as I go", direction: 'P' },
        optionB: { label: "Structured — I want a clear schedule with defined milestones", direction: 'J' },
    },
    {
        id: 17, dimension: 'JP',
        question: "When a new interesting tangent appears while studying, you:",
        optionA: { label: "Follow it — exploration is part of learning", direction: 'P' },
        optionB: { label: "Note it for later and stay on the planned topic", direction: 'J' },
    },
    {
        id: 18, dimension: 'JP',
        question: "You feel more accomplished after a study session when:",
        optionA: { label: "You deeply explored an interesting thread, even if unplanned", direction: 'P' },
        optionB: { label: "You completed everything you set out to do", direction: 'J' },
    },
    {
        id: 19, dimension: 'JP',
        question: "Deadlines make you feel:",
        optionA: { label: "Constrained — I work better with open-ended timelines", direction: 'P' },
        optionB: { label: "Focused — they help me organize my energy efficiently", direction: 'J' },
    },
    {
        id: 20, dimension: 'JP',
        question: "A good learning app should:",
        optionA: { label: "Let me wander through topics freely and discover connections", direction: 'P' },
        optionB: { label: "Give me a clear roadmap with checkpoints and progress tracking", direction: 'J' },
    },
];
