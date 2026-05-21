export const AUTOMATION_TRIGGERS = {
  node_completed: {
    label: 'A node is marked complete',
    icon: '✅',
    configFields: [
      { name: 'node_filter', type: 'select', options: ['any', 'specific'], label: 'Node Filter' },
    ],
  },
  quiz_failed: {
    label: 'Quiz score falls below threshold',
    icon: '❌',
    configFields: [
      { name: 'threshold_pct', type: 'number', default: 60, label: 'Threshold %' },
    ],
  },
  roadmap_completed: {
    label: 'Roadmap is 100% complete',
    icon: '🏆',
    configFields: [],
  },
  collaborator_joined: {
    label: 'A new collaborator joins the roadmap',
    icon: '👋',
    configFields: [],
  },
};

export const AUTOMATION_ACTIONS = {
  post_slack: {
    label: 'Post message to Slack',
    icon: '💬',
    requires_service: 'slack',
    configFields: [
      { name: 'channel', type: 'text', placeholder: '#learning', label: 'Slack Channel' },
      { name: 'message_template', type: 'textarea', placeholder: '{{user}} completed {{node_title}}!', label: 'Message Template' },
    ],
  },
  create_github_issue: {
    label: 'Create a GitHub issue',
    icon: '🐙',
    requires_service: 'github',
    configFields: [
      { name: 'repo', type: 'text', placeholder: 'owner/repo', label: 'Repository' },
      { name: 'title_template', type: 'text', placeholder: 'Review: {{node_title}}', label: 'Issue Title' },
    ],
  },
  create_calendar_event: {
    label: 'Create a Google Calendar event',
    icon: '📅',
    requires_service: 'google_calendar',
    configFields: [
      { name: 'event_title', type: 'text', placeholder: 'Study: {{node_title}}', label: 'Event Title' },
      { name: 'duration_minutes', type: 'number', default: 60, label: 'Duration (minutes)' },
    ],
  },
};
