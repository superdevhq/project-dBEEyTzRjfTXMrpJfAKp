
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
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface WorkoutDetailsProps {
  workout: {
    id?: string;
    name: string;
    date: string;
    duration: string;
    intensity: string;
    exercises: string[] | Exercise[];
    notes?: string;
  };
}

const WorkoutDetails = ({ workout }: WorkoutDetailsProps) => {
  const [open, setOpen] = useState(false);

  // Determine if we have detailed exercise data or just names
  const hasDetailedExercises = workout.exercises.length > 0 && 
    typeof workout.exercises[0] !== 'string';

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
                  {Array.isArray(workout.exercises) 
                    ? hasDetailedExercises 
                      ? `${(workout.exercises as Exercise[]).length} exercises` 
                      : `${(workout.exercises as string[]).length} exercises`
                    : "0 exercises"}
                </span>
              </div>
            </div>
            
            {hasDetailedExercises ? (
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
                    {(workout.exercises as Exercise[]).map((exercise, index) => (
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
                  {(workout.exercises as string[]).map((exercise, index) => (
                    <Badge key={index} variant="secondary">{exercise}</Badge>
                  ))}
                </div>
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
