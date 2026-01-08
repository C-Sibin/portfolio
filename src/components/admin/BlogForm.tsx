import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { z } from "zod";
import DOMPurify from "dompurify";

// Validation schema for blog posts
const blogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().trim().min(1, "Slug is required").max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(500, "Excerpt must be less than 500 characters"),
  content: z.string().min(1, "Content is required").max(100000, "Content is too long"),
  image_url: z.string().url().optional().or(z.literal("")),
  tags: z.string().max(500, "Tags are too long"),
  published: z.boolean()
});

interface BlogFormProps {
  onSuccess: () => void;
}

export const BlogForm = ({ onSuccess }: BlogFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    tags: "",
    slug: "",
    published: false
  });
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Success", description: "Image uploaded" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with Zod
    const validationResult = blogPostSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({ 
        title: "Validation Error", 
        description: firstError.message, 
        variant: "destructive" 
      });
      return;
    }

    // Sanitize content before saving
    const sanitizedContent = DOMPurify.sanitize(formData.content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'title', 'width', 'height',
        'class'
      ],
      ALLOW_DATA_ATTR: false,
    });

    const { error } = await supabase.from('blog_posts').insert({
      ...formData,
      content: sanitizedContent,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Blog post added" });
    setFormData({ title: "", excerpt: "", content: "", image_url: "", tags: "", slug: "", published: false });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-foreground">Title</Label>
        <Input 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          placeholder="Blog post title"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Slug</Label>
        <Input 
          value={formData.slug} 
          onChange={e => setFormData({...formData, slug: e.target.value})} 
          placeholder="my-blog-post"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Excerpt</Label>
        <Textarea 
          value={formData.excerpt} 
          onChange={e => setFormData({...formData, excerpt: e.target.value})}
          placeholder="Brief summary"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Content</Label>
        <RichTextEditor 
          content={formData.content}
          onChange={(content) => setFormData({...formData, content})}
        />
      </div>
      <div>
        <Label className="text-foreground">Featured Image</Label>
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          disabled={uploading}
          className="bg-[#161b22] border-border/50 text-foreground file:bg-primary file:text-primary-foreground file:border-0"
        />
        {formData.image_url && (
          <div className="mt-2">
            <img src={formData.image_url} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-border/50" />
            <p className="text-xs text-green-400 mt-1">✓ Image uploaded</p>
          </div>
        )}
      </div>
      <div>
        <Label className="text-foreground">Tags (comma-separated)</Label>
        <Input 
          value={formData.tags} 
          onChange={e => setFormData({...formData, tags: e.target.value})} 
          placeholder="security, hacking, tools"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch 
          checked={formData.published} 
          onCheckedChange={checked => setFormData({...formData, published: checked})} 
        />
        <Label className="text-foreground">Published</Label>
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="w-4 h-4 mr-2" />
        Add Blog Post
      </Button>
    </form>
  );
};
