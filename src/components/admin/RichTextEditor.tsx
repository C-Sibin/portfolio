import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Undo,
  Redo,
  X,
  Eye,
  Edit3,
  LinkIcon as LinkChainIcon
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    // Ensure URL has protocol
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`;
    
    // If text is selected, just add link to selection
    // If no selection and link text provided, insert new text with link
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    
    if (hasSelection) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else if (linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`)
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    
    setLinkUrl('');
    setLinkText('');
    setLinkDialogOpen(false);
  }, [editor, linkUrl, linkText]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-content/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      
      if (editor && data.publicUrl) {
        editor.chain().focus().setImage({ src: data.publicUrl }).run();
      }
      
      toast({ title: "Success", description: "Image uploaded and inserted" });
      setImageDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setImageDialogOpen(false);
  }, [editor, imageUrl]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    
    // Check if there's selected text
    const { from, to } = editor.state.selection;
    if (from !== to) {
      const selectedText = editor.state.doc.textBetween(from, to);
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }
    
    // Check if cursor is on an existing link
    const linkMark = editor.getAttributes('link');
    if (linkMark.href) {
      setLinkUrl(linkMark.href);
    } else {
      setLinkUrl('');
    }
    
    setLinkDialogOpen(true);
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children,
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`p-2 h-8 w-8 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-[#161b22]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-border/50 bg-[#0d1117]">
        <div className="flex flex-wrap gap-1">
          {/* Undo/Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border/50 mx-1 self-center" />

          {/* Headings */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border/50 mx-1 self-center" />

          {/* Text Formatting */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border/50 mx-1 self-center" />

          {/* Lists */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border/50 mx-1 self-center" />

          {/* Code & Quote */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-border/50 mx-1 self-center" />

          {/* Link */}
          <ToolbarButton 
            onClick={() => {
              if (editor.isActive('link')) {
                removeLink();
              } else {
                openLinkDialog();
              }
            }}
            isActive={editor.isActive('link')}
            title={editor.isActive('link') ? "Remove Link" : "Add Link"}
          >
            {editor.isActive('link') ? <X className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
          </ToolbarButton>

          {/* Image */}
          <ToolbarButton 
            onClick={() => setImageDialogOpen(true)}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`h-8 px-3 gap-1.5 text-xs font-medium ${
              isPreviewMode 
                ? 'bg-primary text-primary-foreground' 
                : 'border-border/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor/Preview Content */}
      {isPreviewMode ? (
        <div className="min-h-[300px] p-6 bg-[#0d1117]">
          <div 
            className="blog-content prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, {
              ADD_ATTR: ['target', 'rel'],
            }) }}
          />
          {!content && (
            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
          )}
        </div>
      ) : (
        <EditorContent editor={editor} className="min-h-[300px]" />
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="bg-[#161b22] border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <LinkChainIcon className="h-5 w-5 text-primary" />
              Insert Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Link Text</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter display text (optional if text selected)"
                className="bg-[#0d1117] border-border/50 text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if you've selected text in the editor
              </p>
            </div>
            <div>
              <Label className="text-foreground">URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-[#0d1117] border-border/50 text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLink} disabled={!linkUrl} className="bg-primary hover:bg-primary/90">
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="bg-[#161b22] border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Insert Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="bg-[#0d1117] border-border/50 text-foreground file:bg-primary file:text-primary-foreground file:border-0"
              />
              {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-muted-foreground text-sm">OR</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div>
              <Label className="text-foreground">Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-[#0d1117] border-border/50 text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addImageUrl} disabled={!imageUrl} className="bg-primary hover:bg-primary/90">
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
