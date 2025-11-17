import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  slug: string;
  status: PostStatus;
  published: boolean;
  tags: string[] | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  slug: string;
  status?: PostStatus;
  tags?: string[];
  category_ids?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  slug?: string;
  status?: PostStatus;
  tags?: string[];
  category_ids?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  private getSupabaseClient() {
    const config = this.configService.getConfig();
    return createClient(config.supabase.url, config.supabase.anonKey);
  }

  /**
   * Get all posts (user's own posts or published posts)
   */
  async getPosts(): Promise<Post[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single post by ID
   */
  async getPost(id: string): Promise<Post | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new post
   */
  async createPost(request: CreatePostRequest): Promise<Post> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const supabase = this.getSupabaseClient();

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: request.title,
        content: request.content || null,
        slug: request.slug,
        status: request.status || 'draft',
        published: request.status === 'published',
        tags: request.tags || null,
        published_at: request.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (postError) throw postError;

    // Add categories if provided
    if (request.category_ids && request.category_ids.length > 0) {
      await this.updatePostCategories(post.id, request.category_ids);
    }

    return post;
  }

  /**
   * Update a post
   */
  async updatePost(id: string, request: UpdatePostRequest): Promise<void> {
    const supabase = this.getSupabaseClient();

    const updateData: any = {
      ...request,
      updated_at: new Date().toISOString(),
    };

    if (request.status) {
      updateData.published = request.status === 'published';
      if (request.status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Remove category_ids from update data (handled separately)
    const categoryIds = request.category_ids;
    delete updateData.category_ids;

    const { error } = await supabase.from('posts').update(updateData).eq('id', id);

    if (error) throw error;

    // Update categories if provided
    if (categoryIds !== undefined) {
      await this.updatePostCategories(id, categoryIds);
    }
  }

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a category
   */
  async createCategory(name: string, slug: string, description?: string): Promise<Category> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, description: description || null })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Update post categories
   */
  private async updatePostCategories(postId: string, categoryIds: string[]): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Delete existing categories
    await supabase.from('post_categories').delete().eq('post_id', postId);

    // Add new categories
    if (categoryIds.length > 0) {
      const postCategories = categoryIds.map((categoryId) => ({
        post_id: postId,
        category_id: categoryId,
      }));

      const { error } = await supabase.from('post_categories').insert(postCategories);
      if (error) throw error;
    }
  }

  /**
   * Get categories for a post
   */
  async getPostCategories(postId: string): Promise<Category[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('post_categories')
      .select('category_id, categories(*)')
      .eq('post_id', postId);

    if (error) throw error;
    return data?.map((pc: any) => pc.categories) || [];
  }
}
