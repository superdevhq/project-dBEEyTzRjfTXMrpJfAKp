
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
}

interface AddExerciseProgressFormProps {
  onSuccess?: () => void;
}

const AddExerciseProgressForm = ({ onSuccess }: AddExerciseProgressFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [exerciseId, setExerciseId] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch exercises when dialog opens
  useEffect(() => {
    if (open) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('id, name')
        .order('name');

      if (error) throw error;

      setExercises(data || []);
      if (data && data.length > 0) {
        setExerciseId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setExerciseId("");
    setWeight("");
    setReps("");
    setSets("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add progress data",
        variant: "destructive",
      });
      return;
    }

    if (!exerciseId) {
      toast({
        title: "Error",
        description: "Please select an exercise",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one metric is provided
    if (!weight && !reps && !sets) {
      toast({
        title: "Error",
        description: "Please provide at least one measurement (weight, reps, or sets)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for insertion
      const progressData = {
        user_id: user.id,
        exercise_id: exerciseId,
        date: new Date().toISOString(),
        weight: weight ? parseFloat(weight) : null,
        reps: reps ? parseInt(reps) : null,
        sets: sets ? parseInt(sets) : null,
        notes: notes || null,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('exercise_progress')
        .insert([progressData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exercise progress added successfully",
      });
      
      resetForm();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding exercise progress:", error);
      toast({
        title: "Error adding progress",
        description: "There was a problem saving your progress data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <LineChart className="h-4 w-4" />
          Add Exercise Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Exercise Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise</Label>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading exercises...</div>
              ) : (
                <Select value={exerciseId} onValueChange={setExerciseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map(exercise => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  placeholder="e.g. 135"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  placeholder="e.g. 8"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  placeholder="e.g. 3"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Progress"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExerciseProgressForm;
