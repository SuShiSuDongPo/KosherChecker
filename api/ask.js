export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `You are a knowledgeable assistant specialised in Jewish dietary laws (kashrut). 
Answer whether a food, ingredient or dish is kosher. If the item is not clearly kosher or not, explain why. 
Feel free to mention different levels of kosher supervision (e.g. OU, OK, Star-K). 
Keep answers concise and helpful. If the question is not about kashrut, gently steer the conversation back to kosher topics.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question }
  ];

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3,
        max_tokens: 300
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const answer = data.choices[0].message.content.trim();
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ error: 'Failed to get answer from DeepSeek' });
  }
}
