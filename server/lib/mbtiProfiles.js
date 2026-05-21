// Full 16-type MBTI to AI prompt instruction map (Server Copy)
export const MBTI_AI_PROFILES = {
    INTJ: {
        name: "The Architect",
        cognitiveStyle: "Systems thinker. Values efficiency, strategic depth, and logical coherence.",
        explanationApproach: "Lead with the theoretical framework. Use precise, technical vocabulary. Avoid hedging language.",
        feedbackTone: "Direct and analytical. State error exactly and the correct reasoning chain.",
        quizFraming: "Frame questions as system design or 'what would break if X changed?' challenges.",
        motivationFrame: "Frame the value in terms of long-term strategic leverage and mastery."
    },
    INTP: {
        name: "The Logician",
        cognitiveStyle: "Analytical, theoretical, loves finding inconsistencies and exploring 'what if' scenarios.",
        explanationApproach: "Present the foundational principle first. Then show the logical derivation.",
        feedbackTone: "Neutral and technical. Flag logical flaw without emotional framing.",
        quizFraming: "Ask questions that require proof or disproof of a claim.",
        motivationFrame: "Frame as an intellectually interesting puzzle."
    },
    ENTJ: {
        name: "The Commander",
        cognitiveStyle: "Goal-driven, decisive, values efficiency and results.",
        explanationApproach: "Lead with outcomes. Explain shortest path to mastery. Assertive and structured.",
        feedbackTone: "Blunt and action-oriented. State gap and fix.",
        quizFraming: "Frame as decision-making scenarios.",
        motivationFrame: "Connect to leadership and measurable outcomes."
    },
    ENTP: {
        name: "The Debater",
        cognitiveStyle: "Creative, contrarian, loves challenging assumptions.",
        explanationApproach: "Present concept, then challenge it. Show where conventional wisdom breaks down.",
        feedbackTone: "Challenging. Pose questions that lead to self-discovery of errors.",
        quizFraming: "Open-ended questions with multiple defensible answers.",
        motivationFrame: "Tool for argumentation and innovation."
    },
    INFJ: {
        name: "The Advocate",
        cognitiveStyle: "Seeks deep meaning. Learns best when 'why it matters' is clear.",
        explanationApproach: "Ground in human impact before mechanics. Use metaphor and narrative.",
        feedbackTone: "Warm but honest. Acknowledge understanding before gaps.",
        quizFraming: "Real-world human impact scenarios.",
        motivationFrame: "Contribution and purpose."
    },
    INFP: {
        name: "The Mediator",
        cognitiveStyle: "Values-driven, imaginative, intrinsically motivated.",
        explanationApproach: "Personal and story-driven. Encourage personal interpretation.",
        feedbackTone: "Gentle and validating. Start with what was right.",
        quizFraming: "Reflective questions: 'What does this mean to you?'",
        motivationFrame: "Personal growth and creative expression."
    },
    ENFJ: {
        name: "The Protagonist",
        cognitiveStyle: "Empathetic, socially aware, inspired by collective progress.",
        explanationApproach: "Frame through lens of people and relationships.",
        feedbackTone: "Encouraging. Celebrate growth explicitly.",
        quizFraming: "Team dynamics or leadership scenarios.",
        motivationFrame: "Inspiring others and social impact."
    },
    ENFP: {
        name: "The Campaigner",
        cognitiveStyle: "Enthusiastic, creative, makes unexpected connections.",
        explanationApproach: "Energetic and varied. Mix storytelling with theory.",
        feedbackTone: "Upbeat. Celebrate attempt, pivot to exciting discovery.",
        quizFraming: "Creative, imaginative 'what if' questions.",
        motivationFrame: "Opening up new possibilities."
    },
    ISTJ: {
        name: "The Logistician",
        cognitiveStyle: "Detail-oriented, systematic, trusts established facts.",
        explanationApproach: "Sequential order. Use numbered steps and citations.",
        feedbackTone: "Precise and factual. State exact error.",
        quizFraming: "Procedural knowledge and standards.",
        motivationFrame: "Reliability and building a solid foundation."
    },
    ISFJ: {
        name: "The Defender",
        cognitiveStyle: "Supportive, patient, detail-oriented.",
        explanationApproach: "Concrete, relatable examples. Build gradually.",
        feedbackTone: "Warm. Emphasize what was right.",
        quizFraming: "Familiar scenarios. No trick questions.",
        motivationFrame: "Helping others and dependability."
    },
    ESTJ: {
        name: "The Executive",
        cognitiveStyle: "Results-oriented, rule-following, structured.",
        explanationApproach: "Lead with best practice. Use checklists.",
        feedbackTone: "Clear and action-oriented.",
        quizFraming: "Rule application and professional decisions.",
        motivationFrame: "Professional competence and efficiency."
    },
    ESFJ: {
        name: "The Consul",
        cognitiveStyle: "Socially aware, motivated by helping others.",
        explanationApproach: "Warm, social examples. Impact on people.",
        feedbackTone: "Encouraging. Acknowledge effort first.",
        quizFraming: "Interpersonal or community scenarios.",
        motivationFrame: "BEing helpful and valued."
    },
    ISTP: {
        name: "The Virtuoso",
        cognitiveStyle: "Hands-on, observatory, learns by doing.",
        explanationApproach: "Lead with mechanism — how it works physically.",
        feedbackTone: "Minimal and direct. State mechanistic fix.",
        quizFraming: "Troubleshooting scenarios.",
        motivationFrame: "New tool for autonomy."
    },
    ISFP: {
        name: "The Adventurer",
        cognitiveStyle: "Sensory, present-focused, aesthetic.",
        explanationApproach: "Concrete and personal. Relatable examples.",
        feedbackTone: "Gentle. Acknowledge perspective first.",
        quizFraming: "Imagine real life encounters.",
        motivationFrame: "Enriching experience and freedom."
    },
    ESTP: {
        name: "The Entrepreneur",
        cognitiveStyle: "Action-oriented, competitive, learns by doing.",
        explanationApproach: "Point immediately. Lead with application.",
        feedbackTone: "Fast. Frame as competitive edge.",
        quizFraming: "Fast-paced scenarios and judgment calls.",
        motivationFrame: "Winning and immediate results."
    },
    ESFP: {
        name: "The Entertainer",
        cognitiveStyle: "Experiential, enthusiastic, socially engaged.",
        explanationApproach: "Dynamic. Use humor and pop culture.",
        feedbackTone: "Upbeat. Celebrate with enthusiasm.",
        quizFraming: "Engaging social scenarios.",
        motivationFrame: "Social recognition and excitement."
    },
};
