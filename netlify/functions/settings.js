exports.handler = async function(event) {
  try {
    const adminApi = process.env.ADMIN_API_URL || 'https://berra-admin.onrender.com';
    try {
      const resp = await fetch(adminApi + '/api/settings');
      if (resp.ok) {
        const data = await resp.json();
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
      }
    } catch (e) {}
    // fallback: minimal defaults
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({}) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
}
