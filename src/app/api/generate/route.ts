import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topics, platforms, quantity } = await req.json();

    if (!topics || !platforms || !quantity) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const results = [];

    for (const topic of topics) {
      const topicResults = {
        topic,
        resources: [] as any[],
      };

      if (platforms.includes('youtube')) {
        const ytVideos = await fetchYouTubeVideos(topic, quantity);
        topicResults.resources.push(...ytVideos);
      }

      if (platforms.includes('gfg')) {
        const gfgArticles = await fetchGoogleSearch(topic, quantity, true);
        topicResults.resources.push(...gfgArticles);
      }

      if (platforms.includes('general')) {
        const generalArticles = await fetchGoogleSearch(topic, quantity, false);
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
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.items) {
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        platform: 'youtube',
      }));
    }
  } catch (error) {
    console.error('YouTube Fetch Error:', error);
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

  const query = isGFG ? `site:geeksforgeeks.org ${topic}` : `-site:geeksforgeeks.org ${topic}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${quantity}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items) {
      return data.items.map((item: any) => ({
        id: item.link,
        title: item.title,
        description: item.snippet,
        thumbnail: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image'],
        url: item.link,
        platform: isGFG ? 'gfg' : 'general',
      }));
    }
  } catch (error) {
    console.error('Google Search Fetch Error:', error);
  }
  return [];
}
