import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const ImageViewModal = ({ isOpen, onClose, imageUrl, title }: ImageViewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-card border-primary/50 overflow-hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <div className="p-4 bg-card border-t border-border">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ViewButtonProps {
  onClick: () => void;
}

export const ViewButton = ({ onClick }: ViewButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-3 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
      onClick={onClick}
    >
      <Eye className="w-4 h-4 mr-2" />
      View Certificate
    </Button>
  );
};
