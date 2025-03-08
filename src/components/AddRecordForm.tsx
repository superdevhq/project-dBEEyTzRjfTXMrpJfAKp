
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";

const AddRecordForm = () => {
  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [previousValue, setPreviousValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be replaced with Supabase integration later
    console.log({
      exercise,
      value,
      previousValue,
      date: new Date().toISOString(),
      isNew: true
    });
    
    // Reset form
    setExercise("");
    setValue("");
    setPreviousValue("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trophy className="h-4 w-4" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Personal Record</DialogTitle>
            <DialogDescription>
              Record a new personal best for any exercise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise">Exercise</Label>
              <Input
                id="exercise"
                placeholder="e.g., Bench Press"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="value">New Record</Label>
              <Input
                id="value"
                placeholder="e.g., 225 lbs or 10 reps"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="previous-value">Previous Record (Optional)</Label>
              <Input
                id="previous-value"
                placeholder="e.g., 215 lbs or 8 reps"
                value={previousValue}
                onChange={(e) => setPreviousValue(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordForm;
