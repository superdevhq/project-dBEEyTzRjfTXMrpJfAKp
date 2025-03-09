
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, Flame, Calendar, MoreHorizontal, Trash } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import WorkoutDetails from "./WorkoutDetails";

interface Exercise {
  id?: string;
  workout_id?: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface WorkoutCardProps {
  workout: {
    id?: string;
    user_id?: string;
    name: string;
    date: string;
    duration: string;
    intensity: string;
    exercises?: Exercise[] | string[] | any;
    notes?: string;
  };
  onDelete: () => void;
}

const WorkoutCard = ({ workout, onDelete }: WorkoutCardProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Ensure exercises is an array
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  
  // Get up to 3 exercises to display in the card
  const displayExercises = exercises.slice(0, 3);
  const hasMoreExercises = exercises.length > 3;

  // Determine intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    try {
      // Delete exercises first (foreign key constraint)
      if (workout.id) {
        const { error: exercisesError } = await supabase
          .from('exercises')
          .delete()
          .eq('workout_id', workout.id);
          
        if (exercisesError) throw exercisesError;
        
        // Then delete the workout
        const { error: workoutError } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workout.id);
          
        if (workoutError) throw workoutError;
        
        toast({
          title: "Workout deleted",
          description: "Your workout has been successfully deleted.",
        });
        
        // Refresh data
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error deleting workout",
        description: "There was a problem deleting your workout.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{workout.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {workout.date}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getIntensityColor(workout.intensity)}>
              {workout.intensity}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workout.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {exercises.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {displayExercises.map((exercise, index) => (
                <Badge key={index} variant="outline">
                  {typeof exercise === 'string' 
                    ? exercise 
                    : exercise?.name || 'Exercise'}
                </Badge>
              ))}
              {hasMoreExercises && (
                <Badge variant="outline">+{exercises.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <WorkoutDetails workout={workout} />
        </div>
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout and all associated exercises.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default WorkoutCard;
