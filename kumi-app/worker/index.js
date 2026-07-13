addEventListener('fetch', function(event) {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(request, event) {
  var url = new URL(request.url);
  var path = url.pathname;

  var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    var response;

    if (path === '/api/health') {
      response = new Response(JSON.stringify({ 
        status: 'ok', 
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (path === '/api/generate' && request.method === 'POST') {
      var body = await request.json();
      var topic = body.topic;

      if (!topic || topic.trim().length === 0) {
        response = new Response(JSON.stringify({
          success: false,
          error: 'INVALID_TOPIC',
          message: 'Topic is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Generate dialogue via DeepSeek
        var dialogue;
        try {
          var apiKey = typeof env !== 'undefined' ? env.DEEPSEEK_API_KEY : '';
          var deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: 'You are a Japanese language teacher. Generate a dialogue for shadowing practice. Return ONLY a JSON array (no markdown) with objects containing: role (partner/user), text_jp (Japanese), furigana (hiragana reading), romaji, id (Indonesian translation). Generate 8-10 lines of natural conversation.'
                },
                {
                  role: 'user',
                  content: 'Generate a Japanese dialogue about: ' + topic
                }
              ],
              temperature: 0.7,
              max_tokens: 1500
            })
          });

          var data = await deepseekResponse.json();
          var content = data.choices[0].message.content;
          var jsonMatch = content.match(/\[[\s\S]*\]/);
          dialogue = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          dialogue = null;
        }

        // Fallback dialogue if DeepSeek fails
        if (!dialogue) {
          dialogue = [
            { role: 'partner', text_jp: 'こんにちは！' + topic + 'について話しましょう。', furigana: 'こんにちは！' + topic + 'についてはなしましょう。', romaji: 'Konnichiwa!', id: 'Halo! Mari bicara tentang ' + topic + '.' },
            { role: 'user', text_jp: 'はい、お願いします。', furigana: 'はい、おねがいします。', romaji: 'Hai, onegaishimasu.', id: 'Ya, tolong.' },
            { role: 'partner', text_jp: 'まず、自己紹介をしてください。', furigana: 'まず、じこしょうかいをしてください。', romaji: 'Mazu, jiko shoukai wo shite kudasai.', id: 'Pertama, perkenalkan diri Anda.' },
            { role: 'user', text_jp: '田中です。よろしくお願いします。', furigana: 'たなかです。よろしくおねがいします。', romaji: 'Tanaka desu. Yoroshiku onegaishimasu.', id: 'Saya Tanaka. Senang berkenalan.' }
          ];
        }

        // Save to D1
        var scenarioId = Date.now();
        try {
          if (typeof env !== 'undefined' && env.DB) {
            var result = await env.DB.prepare(
              'INSERT INTO scenarios (topic_keyword, script_json, audio_url) VALUES (?, ?, ?)'
            ).bind(topic.trim().toLowerCase(), JSON.stringify(dialogue), null).run();
            scenarioId = result.meta.last_row_id;
          }
        } catch (e) {
          console.log('D1 insert error:', e.message);
        }

        response = new Response(JSON.stringify({
          success: true,
          scenario_id: scenarioId,
          cached: false,
          dialogue: dialogue,
          audio_partner: null
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      response = new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add CORS headers
    var newHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(function(key) {
      newHeaders.set(key, corsHeaders[key]);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
