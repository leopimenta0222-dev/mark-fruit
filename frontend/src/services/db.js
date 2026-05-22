import { supabase } from "./supabase.js";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Converte uma linha do Supabase (snake_case) pro formato que as telas usam (camelCase)
function mapPost(row) {
  const ratings = row.ratings || [];
  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    : 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    isSeed: row.is_seed,
    stock: row.stock,
    createdAt: row.created_at,
    authorId: row.author_id,
    author: row.author
      ? {
          id: row.author.id,
          name: row.author.name,
          city: row.author.city,
          state: row.author.state,
          avatar: row.author.avatar,
          latitude: row.author.latitude,
          longitude: row.author.longitude,
        }
      : null,
    averageRating: avg,
    ratingCount: ratings.length,
    distanceKm: null,
  };
}

// ----------------------------------------------------------------
// POSTS
// ----------------------------------------------------------------
export async function listPosts({ q, category, isSeed, sort, lat, lon } = {}) {
  let query = supabase
    .from("posts")
    .select("*, author:profiles(id,name,city,state,avatar,latitude,longitude), ratings(stars)");

  if (category) query = query.eq("category", category);
  if (isSeed !== undefined) query = query.eq("is_seed", isSeed);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let posts = (data || []).map(mapPost);

  // distância (client-side)
  if (lat != null && lon != null) {
    posts = posts.map((p) => {
      if (p.author?.latitude != null && p.author?.longitude != null) {
        p.distanceKm = haversine(lat, lon, p.author.latitude, p.author.longitude);
      }
      return p;
    });
  }

  // ordenação
  if (sort === "rating") {
    posts.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === "nearest" && lat != null) {
    posts.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (sort === "best") {
    posts.sort((a, b) => {
      const sa = a.averageRating - (a.distanceKm ?? 0) * 0.01;
      const sb = b.averageRating - (b.distanceKm ?? 0) * 0.01;
      return sb - sa;
    });
  }

  return posts;
}

export async function getPost(id) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, author:profiles(id,name,city,state,avatar), ratings(id,stars,comment,created_at,user_id,user:profiles(id,name,avatar))"
    )
    .eq("id", id)
    .single();
  if (error) throw error;

  const post = mapPost(data);
  post.ratings = (data.ratings || [])
    .map((r) => ({
      id: r.id,
      stars: r.stars,
      comment: r.comment,
      createdAt: r.created_at,
      userId: r.user_id,
      user: r.user ? { id: r.user.id, name: r.user.name, avatar: r.user.avatar } : null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return post;
}

export async function createPost({ title, description, price, category, isSeed, stock, imageUrl, authorId }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      description,
      price: Number(price),
      category,
      is_seed: !!isSeed,
      stock: Number(stock) || 1,
      image: imageUrl,
      author_id: authorId,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPost(data);
}

export async function deletePost(id) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// Sobe a imagem pro Storage e devolve a URL pública
export async function uploadPostImage(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("post-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

// ----------------------------------------------------------------
// RATINGS
// ----------------------------------------------------------------
export async function ratePost(postId, userId, stars, comment) {
  const { error } = await supabase
    .from("ratings")
    .upsert(
      { post_id: postId, user_id: userId, stars, comment },
      { onConflict: "post_id,user_id" }
    );
  if (error) throw error;
}

export async function deleteRating(postId, userId) {
  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ----------------------------------------------------------------
// PROFILES
// ----------------------------------------------------------------
export async function getProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, posts(*, ratings(stars))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id, fields) {
  const { error } = await supabase.from("profiles").update(fields).eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------
// MESSAGES / CHAT
// ----------------------------------------------------------------
export async function listConversations(userId) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, post:posts(id,title,image), sender:profiles!messages_sender_id_fkey(id,name,avatar), receiver:profiles!messages_receiver_id_fkey(id,name,avatar)"
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const map = new Map();
  for (const m of data || []) {
    const other = m.sender_id === userId ? m.receiver : m.sender;
    const key = `${m.post_id}-${other.id}`;
    if (!map.has(key)) {
      map.set(key, {
        postId: m.post_id,
        post: m.post,
        otherUser: other,
        lastMessage: { content: m.content, createdAt: m.created_at },
      });
    }
  }
  return Array.from(map.values());
}

export async function getMessages(postId, userId, otherUserId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("post_id", postId)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((m) => ({
    id: m.id,
    content: m.content,
    senderId: m.sender_id,
    receiverId: m.receiver_id,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(postId, senderId, receiverId, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ post_id: postId, sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Realtime: ouve novas mensagens de uma conversa
export function subscribeMessages(postId, userId, otherUserId, onMessage) {
  const channel = supabase
    .channel(`chat:${postId}:${userId}:${otherUserId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `post_id=eq.${postId}` },
      (payload) => {
        const m = payload.new;
        const sameChat =
          (m.sender_id === userId && m.receiver_id === otherUserId) ||
          (m.sender_id === otherUserId && m.receiver_id === userId);
        if (sameChat) {
          onMessage({
            id: m.id,
            content: m.content,
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            createdAt: m.created_at,
          });
        }
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
