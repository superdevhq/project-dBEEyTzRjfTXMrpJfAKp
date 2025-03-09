
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
}

interface Workout {
  id: string;
  name: string;
}

const AddProgressForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [exerciseId, setExerciseId] = useState<string>("");
  const [workoutId, setWorkoutId] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [sets, setSets] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises_library')
          .select('id, name')
          .order('name');

        if (exercisesError) throw exercisesError;
        setExercises(exercisesData || []);
        
        if (exercisesData && exercisesData.length > 0) {
          setExerciseId(exercisesData[0].id);
        }

        // Fetch workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workouts')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');

        if (workoutsError) throw workoutsError;
        setWorkouts(workoutsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add progress",
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

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('exercise_progress')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          workout_id: workoutId || null,
          date: date.toISOString(),
          weight: weight ? parseFloat(weight) : null,
          reps: reps ? parseInt(reps) : null,
          sets: sets ? parseInt(sets) : null,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress added successfully",
      });

      // Reset form
      setExerciseId(exercises.length > 0 ? exercises[0].id : "");
      setWorkoutId("");
      setDate(new Date());
      setWeight("");
      setReps("");
      setSets("");
      setNotes("");
      
      // Navigate to charts page
      navigate("/charts");
    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        title: "Error",
        description: "Failed to add progress",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Exercise Progress</CardTitle>
        <CardDescription>Record your exercise progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select value={exerciseId} onValueChange={setExerciseId}>
              <SelectTrigger id="exercise">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout">Workout (Optional)</Label>
            <Select value={workoutId} onValueChange={setWorkoutId}>
              <SelectTrigger id="workout">
                <SelectValue placeholder="Select workout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {workouts.map(workout => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="lbs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="count"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="count"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this exercise"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save Progress"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/charts")}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddProgressForm;
