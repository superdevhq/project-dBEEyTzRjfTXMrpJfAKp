
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  description?: string;
}

interface ExerciseEditDialogProps {
  exercise: Exercise;
  onSuccess: () => void;
}

const ExerciseEditDialog = ({ exercise, onSuccess }: ExerciseEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Exercise name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('exercises_library')
        .update({ name })
        .eq('id', exercise.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error updating exercise",
        description: "There was a problem updating the exercise.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter exercise name"
                />
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <p>Category: {exercise.category}</p>
                <span className="mx-2">•</span>
                <p>Muscle Group: {exercise.muscle_group}</p>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseEditDialog;
