export async function executeMCPAction(connection, actionType, payload) {
  if (!connection) {
    throw new Error('Missing MCP connection information');
  }

  switch (connection.service) {
    case 'slack':
      return postToSlack(connection.connection_config, actionType, payload);
    case 'github':
      return createGithubIssue(connection.connection_config, actionType, payload);
    case 'google_calendar':
      return createCalendarEvent(connection.connection_config, payload);
    case 'notion':
      return exportToNotion(connection.connection_config, payload);
    case 'figma':
      return embedFigmaFrame(connection.connection_config, payload);
    default:
      throw new Error(`Unknown MCP service: ${connection.service}`);
  }
}

async function postToSlack(config, actionType, payload) {
  const token = config?.bot_token;
  if (!token) throw new Error('Slack connection missing bot_token');

  if (actionType === 'post_slack') {
    const body = { channel: payload.channel, text: payload.message_template };
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  }
  return { success: false, reason: 'Unsupported Slack action' };
}

async function createGithubIssue(config, actionType, payload) {
  const token = config?.access_token;
  if (!token) throw new Error('GitHub connection missing access_token');
  if (actionType !== 'create_github_issue') return { success: false, reason: 'Unsupported GitHub action' };

  const [owner, repo] = (payload.repo || '').split('/');
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: payload.title_template, body: payload.message_template || '' }),
  });
  return response.json();
}

async function createCalendarEvent(config, payload) {
  return { success: true, note: 'Calendar event creation is stubbed until OAuth is configured.' };
}

async function exportToNotion(config, payload) {
  return { success: true, note: 'Notion export is stubbed until integration is configured.' };
}

async function embedFigmaFrame(config, payload) {
  return { success: true, note: 'Figma embed is stubbed until OAuth is configured.' };
}
