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
        const gfgArticles = fetchGFGArticles(topic, configs.gfg.quantity);
        topicResults.resources.push(...gfgArticles);
      }

      if (configs.general?.enabled) {
        const generalArticles = await fetchWikipediaArticles(topic, configs.general.quantity);
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

// Curated Database of Top Weblinks based on Search Volumes and Views
const TOP_LINKS_DB: Record<string, any> = {
  "react": {
    gfg: [
      { id: "gfg-react-1", title: "ReactJS Tutorial - GeeksforGeeks", description: "A highly viewed comprehensive guide to ReactJS, including syntax and components.", url: "https://www.geeksforgeeks.org/reactjs-tutorials/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" },
      { id: "gfg-react-2", title: "React Hooks Tutorial", description: "Top searched article on React Hooks, their rules, and custom hooks.", url: "https://www.geeksforgeeks.org/react-hooks/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" },
      { id: "gfg-react-3", title: "Top 50 React Interview Questions", description: "Most viewed React interview questions for preparation.", url: "https://www.geeksforgeeks.org/reactjs-interview-questions/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" }
    ],
    general: [
      { id: "web-react-1", title: "React Official Documentation", description: "The #1 web resource for React. Direct from the maintainers.", url: "https://react.dev/", thumbnail: "", platform: "general" },
      { id: "web-react-2", title: "MDN Web Docs: React", description: "Mozilla's top-tier guide to getting started with React.", url: "https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started", thumbnail: "", platform: "general" },
      { id: "web-react-3", title: "FreeCodeCamp React Course", description: "Highly viewed free course covering all of React.", url: "https://www.freecodecamp.org/news/tag/react/", thumbnail: "", platform: "general" }
    ]
  },
  "node": {
    gfg: [
      { id: "gfg-node-1", title: "Node.js Tutorial", description: "Complete Node.js tutorial from GeeksforGeeks.", url: "https://www.geeksforgeeks.org/nodejs/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" },
      { id: "gfg-node-2", title: "Node.js Streams", description: "Top guide on handling streams efficiently in Node.", url: "https://www.geeksforgeeks.org/node-js-streams/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" },
      { id: "gfg-node-3", title: "Node.js Interview Questions", description: "Most searched backend interview questions.", url: "https://www.geeksforgeeks.org/node-js-interview-questions/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" }
    ],
    general: [
      { id: "web-node-1", title: "Node.js Official Documentation", description: "The definitive AP reference for Node.js.", url: "https://nodejs.org/en/docs/", thumbnail: "", platform: "general" },
      { id: "web-node-2", title: "Node.js Crash Course", description: "Highly rated MDN guidelines for Express and Node.", url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs", thumbnail: "", platform: "general" }
    ]
  },
  "binary search": {
    gfg: [
      { id: "gfg-bs-1", title: "Binary Search Data Structure", description: "The most viewed Binary Search algorithm guide.", url: "https://www.geeksforgeeks.org/binary-search/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" },
      { id: "gfg-bs-2", title: "Binary Tree Data Structure", description: "Trees and Binary Search tutorials.", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" }
    ],
    general: [
      { id: "web-bs-1", title: "Binary Search - Wikipedia", description: "Extensive theory on Wikipedia.", url: "https://en.wikipedia.org/wiki/Binary_search_algorithm", thumbnail: "", platform: "general" },
      { id: "web-bs-2", title: "Khan Academy: Binary Search", description: "Interactive visual tutorial.", url: "https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search", thumbnail: "", platform: "general" }
    ]
  },
  "python": {
    gfg: [
      { id: "gfg-py-1", title: "Python Tutorial", description: "GeeksforGeeks top Python programming guide.", url: "https://www.geeksforgeeks.org/python-programming-language/", thumbnail: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png", platform: "gfg" }
    ],
    general: [
      { id: "web-py-1", title: "Python.org Tutorial", description: "Official Python docs.", url: "https://docs.python.org/3/tutorial/index.html", thumbnail: "", platform: "general" }
    ]
  }
};

function getCuratedLinks(topic: string, platform: 'gfg' | 'general', quantity: number) {
  const t = topic.toLowerCase();
  for (const [key, data] of Object.entries(TOP_LINKS_DB)) {
    if (t.includes(key) && data[platform]) {
      return data[platform].slice(0, quantity);
    }
  }
  return null;
}

function fetchGFGArticles(topic: string, quantity: number) {
  // 1. Try to get Top Curated Links first
  const curated = getCuratedLinks(topic, 'gfg', quantity);
  if (curated) return curated;

  // 2. Fallback to generic URL construction
  const results = [];
  const encodedTopic = encodeURIComponent(topic);
  
  results.push({
    id: `gfg-${topic}-1`,
    title: `${topic} Tutorial & Guide - GeeksforGeeks`,
    description: `Comprehensive guide and tutorial on ${topic} from GeeksforGeeks.`,
    thumbnail: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
    url: `https://duckduckgo.com/?q=!ducky+site:geeksforgeeks.org+${encodedTopic}`,
    platform: 'gfg'
  });

  if (quantity > 1) {
    results.push({
      id: `gfg-${topic}-2`,
      title: `Practice ${topic} Problems`,
      description: `Test your knowledge and practice coding problems on ${topic} at GeeksforGeeks.`,
      thumbnail: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
      url: `https://duckduckgo.com/?q=!ducky+site:geeksforgeeks.org+practice+problems+${encodedTopic}`,
      platform: 'gfg'
    });
  }

  if (quantity > 2) {
    results.push({
      id: `gfg-${topic}-3`,
      title: `Top ${topic} Interview Questions`,
      description: `Common interview questions and answers related to ${topic}.`,
      thumbnail: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
      url: `https://duckduckgo.com/?q=!ducky+site:geeksforgeeks.org+interview+questions+${encodedTopic}`,
      platform: 'gfg'
    });
  }

  for (let i = 3; i < quantity; i++) {
    results.push({
      id: `gfg-${topic}-${i+1}`,
      title: `${topic} Advanced Concepts`,
      description: `Deep dive into advanced concepts of ${topic} on GeeksforGeeks.`,
      thumbnail: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
      url: `https://duckduckgo.com/?q=!ducky+site:geeksforgeeks.org+advanced+${encodedTopic}`,
      platform: 'gfg'
    });
  }
  
  return results.slice(0, quantity);
}

async function fetchWikipediaArticles(topic: string, quantity: number) {
  // 1. Try to get Top Curated Links first
  const curated = getCuratedLinks(topic, 'general', quantity);
  if (curated) return curated;

  // 2. Fallback to Wikipedia API
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&utf8=&format=json&srlimit=${quantity}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.query?.search || []).map((item: any) => ({
      id: item.pageid.toString(),
      title: item.title,
      description: item.snippet ? item.snippet.replace(/<[^>]*>?/gm, '') + '...' : '',
      thumbnail: '',
      url: `https://en.wikipedia.org/?curid=${item.pageid}`,
      platform: 'general',
    }));
  } catch (error) {
    return [];
  }
}
