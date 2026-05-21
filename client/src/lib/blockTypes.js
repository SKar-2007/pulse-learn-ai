import { GitBranch, CheckSquare, BarChart2, FileText, Activity, Sparkles, Share2, Bot } from 'lucide-react';

export const BLOCK_TYPES = [
  { type: 'skill_tree', label: 'Skill Tree', icon: GitBranch, desc: 'Adaptive learning path' },
  { type: 'quiz', label: 'Active Recall', icon: CheckSquare, desc: 'AI-generated assessment' },
  { type: 'analytics', label: 'Learning Charts', icon: BarChart2, desc: 'Visual progress charts' },
  { type: 'notes', label: 'Notes', icon: FileText, desc: 'Rich-text study notes' },
  { type: 'progress', label: 'Stats Ring', icon: Activity, desc: 'Completion metrics' },
  { type: 'summary', label: 'Smart Brief', icon: Sparkles, desc: 'AI synthesis of workspace' },
  { type: 'loop_component', label: 'Loop Component', icon: Share2, desc: 'Embed a live shared block' },
  { type: 'recap', label: 'AI Recap', icon: Sparkles, desc: 'AI-generated page summary' },
  { type: 'ai_chat', label: 'AI Assistant', icon: Bot, desc: 'Workspace AI chat panel' },
];
