// Full 16-type MBTI to AI prompt instruction map
export const MBTI_AI_PROFILES = {
    INTJ: {
        name: "The Architect",
        cognitiveStyle: "Systems thinker. Values efficiency, strategic depth, and logical coherence.",
        explanationApproach: "Lead with the theoretical framework, then show how details fit into it. Use precise, technical vocabulary without simplifying. Avoid hedging language.",
        feedbackTone: "Direct and analytical. State what was incorrect, why it was incorrect, and the correct reasoning chain.",
        quizFraming: "Frame questions as system design or 'what would break if X changed?' challenges.",
        motivationFrame: "Frame the value of the skill in terms of long-term strategic leverage and mastery."
    },
    INTP: {
        name: "The Logician",
        cognitiveStyle: "Analytical, theoretical, loves finding inconsistencies and exploring 'what if' scenarios.",
        explanationApproach: "Present the foundational principle first. Then show the logical derivation of every sub-concept from that principle.",
        feedbackTone: "Neutral and technical. Flag the specific logical flaw without emotional framing.",
        quizFraming: "Ask questions that require the learner to prove or disprove a claim.",
        motivationFrame: "Frame the skill as an intellectually interesting puzzle."
    },
    ENTJ: {
        name: "The Commander",
        cognitiveStyle: "Goal-driven, decisive, values efficiency and results.",
        explanationApproach: "Lead with outcomes and applications. Explain the shortest, highest-leverage path to mastery. Be assertive and structured.",
        feedbackTone: "Blunt and action-oriented. State the gap, state the fix, move on.",
        quizFraming: "Frame questions as decision-making scenarios: 'Given X situation, what is the optimal strategy?'",
        motivationFrame: "Connect the skill directly to leadership, competitive advantage, or measurable outcomes."
    },
    ENTP: {
        name: "The Debater",
        cognitiveStyle: "Creative, contrarian, loves challenging assumptions and exploring multiple perspectives.",
        explanationApproach: "Present the concept, then immediately challenge it. Show where the conventional wisdom breaks down.",
        feedbackTone: "Challenging and engaging. Pose a question that leads the learner to find the error themselves.",
        quizFraming: "Ask open-ended questions that have multiple defensible answers.",
        motivationFrame: "Frame the skill as a tool for argumentation, innovation, or disrupting the status quo."
    },
    INFJ: {
        name: "The Advocate",
        cognitiveStyle: "Seeks deep meaning and connection. Learns best when the 'why it matters' is clear.",
        explanationApproach: "Ground every concept in human impact or broader meaning before presenting mechanics.",
        feedbackTone: "Warm but honest. Acknowledge what was understood well before addressing gaps.",
        quizFraming: "Frame questions around real-world human impact scenarios.",
        motivationFrame: "Frame the skill in terms of contribution, purpose, and the positive change it enables."
    },
    INFP: {
        name: "The Mediator",
        cognitiveStyle: "Values-driven, imaginative, intrinsically motivated.",
        explanationApproach: "Make the content personal and story-driven. Encourage personal interpretation.",
        feedbackTone: "Gentle, validating, and specific. Begin with what the learner got right.",
        quizFraming: "Ask reflective questions: 'What does this concept mean to you?'",
        motivationFrame: "Connect the skill to personal growth, creative expression, or a deeply held value."
    },
    ENFJ: {
        name: "The Protagonist",
        cognitiveStyle: "Empathetic, socially aware, inspired by collective progress and leadership.",
        explanationApproach: "Frame concepts through the lens of people and relationships.",
        feedbackTone: "Encouraging and specific. Celebrate growth explicitly.",
        quizFraming: "Frame questions around team dynamics or leadership scenarios.",
        motivationFrame: "Frame the skill in terms of inspiring others, building better teams, or having a positive social impact."
    },
    ENFP: {
        name: "The Campaigner",
        cognitiveStyle: "Enthusiastic, creative, makes unexpected connections.",
        explanationApproach: "Keep it energetic and varied. Mix storytelling with concept explanation.",
        feedbackTone: "Upbeat and forward-looking. Celebrate the attempt, quickly pivot to what's exciting.",
        quizFraming: "Ask creative, scenario-based questions. Reward unexpected but logically sound answers.",
        motivationFrame: "Frame the skill as opening up new possibilities, adventures, or creative directions."
    },
    ISTJ: {
        name: "The Logistician",
        cognitiveStyle: "Detail-oriented, systematic, trusts established methods and proven facts.",
        explanationApproach: "Present information in strict sequential order. Use numbered steps and clear definitions.",
        feedbackTone: "Precise and factual. State exactly what was incorrect, reference the correct definition.",
        quizFraming: "Test procedural knowledge: 'What is the correct sequence of steps?'",
        motivationFrame: "Frame the skill in terms of reliability, correctness, and building a dependable foundation."
    },
    ISFJ: {
        name: "The Defender",
        cognitiveStyle: "Supportive, patient, detail-oriented.",
        explanationApproach: "Use concrete, relatable real-world examples. Build understanding gradually.",
        feedbackTone: "Warm and supportive. Emphasize what was understood correctly.",
        quizFraming: "Use familiar, relatable scenarios. Avoid abstract or trick questions.",
        motivationFrame: "Frame the skill in terms of helping others, reliability, and building a solid knowledge base."
    },
    ESTJ: {
        name: "The Executive",
        cognitiveStyle: "Results-oriented, rule-following, values clear structure.",
        explanationApproach: "Lead with the correct answer or best practice, then explain why. Use checklists and rules.",
        feedbackTone: "Clear and action-oriented. State the problem, the standard, and the corrected approach.",
        quizFraming: "Test rule application: 'What is the correct procedure here?'",
        motivationFrame: "Frame the skill in terms of professional competence and measurable results."
    },
    ESFJ: {
        name: "The Consul",
        cognitiveStyle: "Socially aware, values harmony and cooperation. Motivated by helping others.",
        explanationApproach: "Use warm, social examples. Frame concepts through the impact they have on people.",
        feedbackTone: "Encouraging and empathetic. Lead with acknowledgment, follow with specific guidance.",
        quizFraming: "Frame questions as interpersonal or community scenarios.",
        motivationFrame: "Frame the skill in terms of being more helpful, supportive, and valued by others."
    },
    ISTP: {
        name: "The Virtuoso",
        cognitiveStyle: "Hands-on, observational, learns best by doing.",
        explanationApproach: "Lead with the mechanism — how does this actually work? Use worked examples.",
        feedbackTone: "Minimal and direct. State what broke and why, mechanistically.",
        quizFraming: "Frame questions as troubleshooting scenarios: 'Given this behavior, what is the cause?'",
        motivationFrame: "Frame the skill as a new tool or technique that gives greater capability."
    },
    ISFP: {
        name: "The Adventurer",
        cognitiveStyle: "Sensory, present-focused, aesthetic.",
        explanationApproach: "Keep explanations concrete, personal, and experiential. Avoid abstract jargon.",
        feedbackTone: "Gentle and respectful. Acknowledge the learner's perspective.",
        quizFraming: "Frame questions as personal experience scenarios.",
        motivationFrame: "Frame the skill in terms of enriching personal experience and creative expression."
    },
    ESTP: {
        name: "The Entrepreneur",
        cognitiveStyle: "Action-oriented, competitive, learns by doing.",
        explanationApproach: "Get to the point immediately. Lead with actionable application.",
        feedbackTone: "Fast and direct. State the gap in one sentence. Frame as competitive advantage.",
        quizFraming: "Frame questions as fast-paced real-world scenarios: 'You have 30 seconds to decide.'",
        motivationFrame: "Frame the skill in terms of winning, speed, and visible immediate results."
    },
    ESFP: {
        name: "The Entertainer",
        cognitiveStyle: "Experiential, enthusiastic, socially engaged.",
        explanationApproach: "Keep it dynamic and varied. Use stories, humor, and relatable scenarios.",
        feedbackTone: "Upbeat and affirming. Celebrate what went well with genuine enthusiasm.",
        quizFraming: "Frame questions as engaging social or real-life scenarios.",
        motivationFrame: "Frame the skill in terms of fun, social recognition, and exciting experiences."
    },
};
