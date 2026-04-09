import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topics, configs } = await req.json();

    if (!topics || !configs) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const results = [];

    for (const topic of topics) {
      const topicResults = {
        topic,
        resources: [] as any[],
      };

      if (configs.youtube?.enabled) {
        const ytVideos = await fetchYouTubeVideos(topic, configs.youtube.quantity);
        topicResults.resources.push(...ytVideos);
      }

      if (configs.gfg?.enabled) {
        const gfgArticles = await fetchGoogleSearch(topic, configs.gfg.quantity, true);
        topicResults.resources.push(...gfgArticles);
      }

      if (configs.general?.enabled) {
        const generalArticles = await fetchGoogleSearch(topic, configs.general.quantity, false);
        topicResults.resources.push(...generalArticles);
      }

      results.push(topicResults);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

async function fetchYouTubeVideos(topic: string, quantity: number) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YouTube API Key missing');
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${quantity}&q=${encodeURIComponent(topic)}&type=video&key=${apiKey}`;
  
  console.log(`[DEBUG] Fetching YouTube for: ${topic}`);
  console.log(`[DEBUG] YouTube URL: ${url.replace(apiKey, 'REDACTED')}`);

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      console.error(`[DEBUG] YouTube API Error: ${data.error.message}`);
      return [];
    }

    if (!data.items || data.items.length === 0) {
      console.warn(`[DEBUG] No YouTube results found for: ${topic}`);
      return [];
    }

    console.log(`[DEBUG] Found ${data.items.length} YouTube videos for: ${topic}`);

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      platform: 'youtube',
    }));
  } catch (error) {
    console.error('[DEBUG] YouTube Fetch Error:', error);
  }
  return [];
}

async function fetchGoogleSearch(topic: string, quantity: number, isGFG: boolean) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  
  if (!apiKey || !cx) {
    console.warn('Google Search API Key or CX missing');
    return [];
  }

  const query = isGFG ? `site:geeksforgeeks.org ${topic}` : topic;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${quantity}`;

  console.log(`[DEBUG] Fetching ${isGFG ? 'GFG' : 'General'} Search for: ${topic}`);
  console.log(`[DEBUG] URL: ${url.replace(apiKey, 'REDACTED')}`);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error(`[DEBUG] Google Search API Full Error Response:\n`, JSON.stringify(data, null, 2));
      return [];
    }

    if (!data.items || data.items.length === 0) {
      console.warn(`[DEBUG] No results found for: ${topic}. Full response from Google:\n`, JSON.stringify(data, null, 2));
      return [];
    }

    console.log(`[DEBUG] Found ${data.items.length} results for: ${topic}`);

    return data.items.map((item: any) => ({
      id: item.link,
      title: item.title,
      description: item.snippet,
      thumbnail: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image'],
      url: item.link,
      platform: isGFG ? 'gfg' : 'general',
    }));
  } catch (error) {
    console.error('[DEBUG] Google Search Fetch Error:', error);
  }
  return [];
}
