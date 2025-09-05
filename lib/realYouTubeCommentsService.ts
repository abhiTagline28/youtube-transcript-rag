// Real YouTube Data API v3 implementation for fetching actual comments
export interface RealYouTubeComment {
  text: string;
  author: string;
  likeCount: number;
  publishedAt: Date;
  replyCount?: number;
  isReply?: boolean;
  parentId?: string;
}

export async function fetchRealYouTubeComments(
  videoId: string, 
  apiKey: string
): Promise<RealYouTubeComment[]> {
  try {
    console.log(`Fetching real comments for video: ${videoId}`);
    
    // YouTube Data API v3 endpoint for comments
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?` +
      `part=snippet&` +
      `videoId=${videoId}&` +
      `key=${apiKey}&` +
      `maxResults=100&` +
      `order=relevance&` +
      `textFormat=plainText`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No comments found for this video');
      return [];
    }
    
    const comments: RealYouTubeComment[] = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        text: snippet.textDisplay,
        author: snippet.authorDisplayName,
        likeCount: snippet.likeCount || 0,
        publishedAt: new Date(snippet.publishedAt),
        replyCount: snippet.replyCount || 0,
        isReply: false,
        parentId: item.id
      };
    });
    
    console.log(`Successfully fetched ${comments.length} real comments`);
    return comments;
    
  } catch (error) {
    console.error('Error fetching real YouTube comments:', error);
    throw error;
  }
}

// Function to get comment replies
export async function fetchCommentReplies(
  parentId: string,
  apiKey: string
): Promise<RealYouTubeComment[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/comments?` +
      `part=snippet&` +
      `parentId=${parentId}&` +
      `key=${apiKey}&` +
      `maxResults=50&` +
      `textFormat=plainText`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items?.map((item: any) => {
      const snippet = item.snippet;
      return {
        text: snippet.textDisplay,
        author: snippet.authorDisplayName,
        likeCount: snippet.likeCount || 0,
        publishedAt: new Date(snippet.publishedAt),
        isReply: true,
        parentId: parentId
      };
    }) || [];
    
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    return [];
  }
}
