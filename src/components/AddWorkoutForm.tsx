
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

const AddWorkoutForm = () => {
  const [open, setOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", weight: "" }
  ]);
  const [notes, setNotes] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be replaced with Supabase integration later
    console.log({
      name: workoutName,
      date: new Date().toISOString(),
      exercises,
      notes
    });
    
    // Reset form
    setWorkoutName("");
    setExercises([{ name: "", sets: "", reps: "", weight: "" }]);
    setNotes("");
    setOpen(false);
  };

  return (
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
                    <Input
                      id={`exercise-name-${index}`}
                      placeholder="e.g., Bench Press"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                      required
                    />
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
            <Button type="submit">Save Workout</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkoutForm;
