
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, Flame } from "lucide-react";

interface Exercise {
  id?: string;
  workout_id?: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface WorkoutDetailsProps {
  workout: {
    id?: string;
    user_id?: string;
    name: string;
    date: string;
    duration: string;
    intensity: string;
    exercises?: string[] | Exercise[] | any;
    notes?: string;
  };
}

const WorkoutDetails = ({ workout }: WorkoutDetailsProps) => {
  const [open, setOpen] = useState(false);

  // Ensure exercises is an array
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  
  // Determine if we have detailed exercise data or just names
  const hasDetailedExercises = exercises.length > 0 && 
    typeof exercises[0] !== 'string' && 
    exercises[0] !== null &&
    typeof exercises[0] === 'object';

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto"
      >
        View Details
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{workout.name}</DialogTitle>
            <DialogDescription>
              {workout.date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{workout.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Intensity: {workout.intensity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {exercises.length} exercises
                </span>
              </div>
            </div>
            
            {exercises.length > 0 ? (
              hasDetailedExercises ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Exercises</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead className="text-right">Sets</TableHead>
                        <TableHead className="text-right">Reps</TableHead>
                        <TableHead className="text-right">Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.map((exercise: Exercise, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{exercise.name}</TableCell>
                          <TableCell className="text-right">{exercise.sets}</TableCell>
                          <TableCell className="text-right">{exercise.reps}</TableCell>
                          <TableCell className="text-right">{exercise.weight}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-2">Exercises</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercises.map((exercise: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {typeof exercise === 'string' ? exercise : 'Exercise'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-2">Exercises</h3>
                <p className="text-sm text-muted-foreground">No exercises recorded for this workout.</p>
              </div>
            )}
            
            {workout.notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{workout.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkoutDetails;
