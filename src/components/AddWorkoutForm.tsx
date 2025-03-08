
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DATA_UPDATED_EVENT } from "@/pages/Index";
import ExerciseSelector from "./ExerciseSelector";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  description?: string;
}

interface AddWorkoutFormProps {
  onSuccess?: () => void;
}

const AddWorkoutForm = ({ onSuccess }: AddWorkoutFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("30 min");
  const [workoutIntensity, setWorkoutIntensity] = useState("Moderate");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", weight: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    setExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length > 1) {
      const updatedExercises = [...exercises];
      updatedExercises.splice(index, 1);
      setExercises(updatedExercises);
    }
  };

  const openExerciseSelector = (index: number) => {
    setCurrentExerciseIndex(index);
    setSelectorOpen(true);
  };

  const handleSelectExercise = (exercise: LibraryExercise) => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExerciseIndex].name = exercise.name;
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a workout.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Insert workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          user_id: user.id,
          name: workoutName,
          date: new Date().toISOString(),
          duration: workoutDuration,
          intensity: workoutIntensity,
          notes: notes
        }])
        .select();

      if (workoutError) throw workoutError;
      
      if (workoutData && workoutData.length > 0) {
        const workoutId = workoutData[0].id;
        
        // Insert exercises
        const exercisesWithWorkoutId = exercises.map(exercise => ({
          workout_id: workoutId,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight
        }));
        
        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesWithWorkoutId);
          
        if (exercisesError) throw exercisesError;
        
        toast({
          title: "Workout added!",
          description: "Your workout has been successfully recorded.",
        });
        
        // Reset form
        setWorkoutName("");
        setWorkoutDuration("30 min");
        setWorkoutIntensity("Moderate");
        setExercises([{ name: "", sets: "", reps: "", weight: "" }]);
        setNotes("");
        setOpen(false);
        
        // Trigger data refresh
        if (onSuccess) {
          onSuccess();
        }
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
      }
    } catch (error: any) {
      console.error("Error adding workout:", error);
      toast({
        title: "Error adding workout",
        description: error.message || "There was a problem saving your workout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Workout
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Workout</DialogTitle>
              <DialogDescription>
                Record your workout details. Add all exercises you performed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  placeholder="e.g., Upper Body Strength"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="workout-duration">Duration</Label>
                  <Input
                    id="workout-duration"
                    placeholder="e.g., 45 min"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workout-intensity">Intensity</Label>
                  <select
                    id="workout-intensity"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={workoutIntensity}
                    onChange={(e) => setWorkoutIntensity(e.target.value)}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddExercise}
                    className="h-8 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Exercise
                  </Button>
                </div>
                
                {exercises.map((exercise, index) => (
                  <div key={index} className="grid gap-3 p-3 border rounded-md">
                    <div className="grid gap-2">
                      <Label htmlFor={`exercise-name-${index}`}>Exercise Name</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`exercise-name-${index}`}
                            placeholder="e.g., Bench Press"
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                            required
                            className={exercise.name ? "" : "pr-10"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openExerciseSelector(index)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 flex-shrink-0"
                          onClick={() => openExerciseSelector(index)}
                        >
                          <Dumbbell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor={`sets-${index}`}>Sets</Label>
                        <Input
                          id={`sets-${index}`}
                          placeholder="e.g., 3"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`reps-${index}`}>Reps</Label>
                        <Input
                          id={`reps-${index}`}
                          placeholder="e.g., 10"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`weight-${index}`}>Weight</Label>
                        <Input
                          id={`weight-${index}`}
                          placeholder="e.g., 135 lbs"
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, "weight", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExercise(index)}
                        className="justify-self-end text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about your workout..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Workout"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExerciseSelector 
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectExercise={handleSelectExercise}
      />
    </>
  );
};

export default AddWorkoutForm;
