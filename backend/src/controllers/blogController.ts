import { Request, Response } from 'express';
import Blog from '../models/Blog.js';
import { AuthRequest } from '../middleware/auth.js';

// Helpers
const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

// ── Public routes ────────────────────────────────────────────────────────────

export const getPublicPosts = async (req: Request, res: Response) => {
  try {
    const { tag, search } = req.query;
    const filter: any = { status: 'published', isPublic: true };
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
    ];

    const posts = await Blog.find(filter)
      .select('-content')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPublicPost = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await Blog.findOne({ slug, status: 'published', isPublic: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ── Admin routes ─────────────────────────────────────────────────────────────

export const adminGetAllPosts = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const total = await Blog.countDocuments({});
    const posts = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const adminGetPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, excerpt, coverImage, status, isPublic, tags, metaTitle, metaDescription } = req.body;

    const finalSlug = slug
      ? slugify(slug)
      : slugify(title) + '-' + Date.now().toString(36);

    const exists = await Blog.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ message: 'A post with this slug already exists. Please use a different title or slug.' });
    }

    const post = await Blog.create({
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || content.slice(0, 160).replace(/[#*`]/g, ''),
      coverImage,
      status: status || 'draft',
      isPublic: isPublic ?? false,
      author: req.user?.name || 'Admin',
      tags: tags || [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, coverImage, status, isPublic, tags, metaTitle, metaDescription } = req.body;

    const post = await Blog.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (slug && slug !== post.slug) {
      const finalSlug = slugify(slug);
      const conflicting = await Blog.findOne({ slug: finalSlug });
      if (conflicting && String(conflicting._id) !== id) {
        return res.status(400).json({ message: 'Slug already in use' });
      }
      post.slug = finalSlug;
    }

    if (title) post.title = title;
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (status) post.status = status;
    if (isPublic !== undefined) post.isPublic = isPublic;
    if (tags) post.tags = tags;
    if (metaTitle) post.metaTitle = metaTitle;
    if (metaDescription) post.metaDescription = metaDescription;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
