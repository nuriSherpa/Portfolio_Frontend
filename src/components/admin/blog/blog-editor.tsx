// src/app/(cms-portal)/components/blog/blog-editor.tsx
'use client';

import { useState, useCallback } from 'react';
import { Save, Image as ImageIcon, Type, Settings, Eye, Code } from 'lucide-react';
import { MarkdownEditor } from './markdown-editor';
import Link from 'next/link';
import { ImageUpload } from './image-upload';

interface BlogEditorProps {
  initialData: any;
  onSave: (data: any) => void;
  saving: boolean;
}

type Tab = 'content' | 'seo' | 'settings';

export function BlogEditor({ initialData, onSave, saving }: BlogEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    excerpt: initialData.excerpt || '',
    category: initialData.category || '',
    tags: initialData.tags?.join(', ') || '',
    status: initialData.status || 'draft',
    featuredImage: initialData.featuredImage || '',
    featuredImageAlt: initialData.featuredImageAlt || '',
    metaTitle: initialData.metaTitle || '',
    metaDescription: initialData.metaDescription || '',
    focusKeyword: initialData.focusKeyword || '',
  });

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = () => {
    onSave({
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
    });
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: Type },
    { id: 'seo', label: 'SEO', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Eye },
  ] as const;

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter post title..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <ImageUpload
                currentImage={formData.featuredImage}
                onUpload={(url) => updateField('featuredImage', url)}
                onRemove={() => updateField('featuredImage', '')}
              />
              {formData.featuredImage && (
                <input
                  type="text"
                  value={formData.featuredImageAlt}
                  onChange={(e) => updateField('featuredImageAlt', e.target.value)}
                  placeholder="Image alt text for SEO"
                  className="mt-2 w-full px-3 py-2 text-sm border rounded"
                />
              )}
            </div>

            {/* Markdown Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown) *
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => updateField('content', value)}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Brief description of the post..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from content if left empty
              </p>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="react, javascript, tutorial"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                These fields help your post rank better in search engines.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => updateField('metaTitle', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Defaults to post title"
              />
              <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Brief summary for search results..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 150-160 characters. Defaults to excerpt.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keyword</label>
              <input
                type="text"
                value={formData.focusKeyword}
                onChange={(e) => updateField('focusKeyword', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Main keyword for this post"
              />
            </div>

            {/* SEO Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-xs text-gray-500 uppercase mb-2">Google Preview</p>
              <div className="bg-white p-4 rounded border">
                <p className="text-blue-600 text-lg truncate">
                  {formData.metaTitle || formData.title || 'Post Title'}
                </p>
                <p className="text-green-700 text-sm">
                  tendinurisherpa.com.np › blog › {initialData.slug}
                </p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {formData.metaDescription || formData.excerpt || 'No description provided...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="draft">Draft - Only visible to you</option>
                <option value="published">Published - Live on site</option>
                <option value="archived">Archived - Hidden from public</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Post Info</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">
                    {new Date(initialData.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900">
                    {new Date(initialData.lastUpdatedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Published</dt>
                  <dd className="text-gray-900">
                    {initialData.publishedAt
                      ? new Date(initialData.publishedAt).toLocaleDateString()
                      : 'Not published yet'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Views</dt>
                  <dd className="text-gray-900">{initialData.views || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reading Time</dt>
                  <dd className="text-gray-900">{initialData.readingTime || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Word Count</dt>
                  <dd className="text-gray-900">{initialData.wordCount || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
        <Link href="/xk92-cms/blogs" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || !formData.title || !formData.content}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
