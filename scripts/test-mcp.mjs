import fs from 'fs';

const content = fs.readFileSync('.env.local', 'utf-8');
let token = '';
let endpoint = 'https://questathon.aihackerscollective.com/api/public/mcp';

for (const rawLine of content.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (line.startsWith('#') || !line) continue;
  const idx = line.indexOf('=');
  if (idx !== -1) {
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key === 'AQ_TOKEN') token = val;
    if (key === 'AQ_MCP_ENDPOINT') endpoint = val;
  }
}

console.log('Parsed token:', token ? `${token.slice(0, 15)}... (len ${token.length})` : 'EMPTY');
console.log('Parsed endpoint:', endpoint);

async function callTool(name, args = {}) {
  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name,
      arguments: args
    }
  };

  console.log(`\n--- Calling ${name} with args ${JSON.stringify(args)} ---`);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json, text/event-stream',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('HTTP Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Response length:', text.length);

  try {
    const json = JSON.parse(text);
    if (json.result && json.result.content && json.result.content[0]) {
      const parsedText = JSON.parse(json.result.content[0].text);
      return parsedText;
    }
    return json;
  } catch (e) {
    console.log('Parse error or text:', e.message);
    return text;
  }
}

callTool('get_my_accounts').then(data => {
  fs.writeFileSync('.cache/real-accounts.json', JSON.stringify(data, null, 2));
  console.log('SUCCESS! Saved to .cache/real-accounts.json');
  console.log('Keys in data:', Object.keys(data));
  console.log('Preview:', JSON.stringify(data).slice(0, 600));
}).catch(err => {
  console.error('FAILED:', err);
});
