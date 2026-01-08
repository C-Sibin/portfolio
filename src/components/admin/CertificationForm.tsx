import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CertificationFormProps {
  onSuccess: () => void;
}

export const CertificationForm = ({ onSuccess }: CertificationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issue_date: "",
    credential_id: "",
    credential_url: "",
    image_url: "",
    display_order: 0,
    certification_type: "professional" as "professional" | "ctf"
  });
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `certifications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('certifications').insert(formData);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Certification added successfully" });
    setFormData({ title: "", issuer: "", issue_date: "", credential_id: "", credential_url: "", image_url: "", display_order: 0, certification_type: "professional" });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-foreground">Title</Label>
        <Input 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          placeholder="e.g., AWS Solutions Architect"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Issuer</Label>
        <Input 
          value={formData.issuer} 
          onChange={e => setFormData({...formData, issuer: e.target.value})} 
          placeholder="e.g., Amazon Web Services"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Issue Date</Label>
        <Input 
          type="date" 
          value={formData.issue_date} 
          onChange={e => setFormData({...formData, issue_date: e.target.value})}
          className="bg-[#161b22] border-border/50 text-foreground"
          required 
        />
      </div>
      <div>
        <Label className="text-foreground">Credential ID</Label>
        <Input 
          value={formData.credential_id} 
          onChange={e => setFormData({...formData, credential_id: e.target.value})}
          placeholder="Optional"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <Label className="text-foreground">Credential URL</Label>
        <Input 
          value={formData.credential_url} 
          onChange={e => setFormData({...formData, credential_url: e.target.value})}
          placeholder="Optional"
          className="bg-[#161b22] border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <Label className="text-foreground">Certificate Image</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="bg-[#161b22] border-border/50 text-foreground"
            disabled={uploading}
          />
          {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
        </div>
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="mt-2 h-20 w-auto rounded" />
        )}
      </div>
      <div>
        <Label className="text-foreground">Certification Type</Label>
        <select 
          value={formData.certification_type} 
          onChange={e => setFormData({...formData, certification_type: e.target.value as "professional" | "ctf"})}
          className="w-full h-10 px-3 rounded-md bg-[#161b22] border border-border/50 text-foreground"
        >
          <option value="professional">Professional</option>
          <option value="ctf">CTF</option>
        </select>
      </div>
      <div>
        <Label className="text-foreground">Display Order</Label>
        <Input 
          type="number" 
          value={formData.display_order} 
          onChange={e => setFormData({...formData, display_order: parseInt(e.target.value)})}
          className="bg-[#161b22] border-border/50 text-foreground"
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={uploading}>
        <Plus className="w-4 h-4 mr-2" />
        Add Certificate
      </Button>
    </form>
  );
};
