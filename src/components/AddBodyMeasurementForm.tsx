
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Ruler } from "lucide-react";

interface AddBodyMeasurementFormProps {
  onSuccess?: () => void;
}

const AddBodyMeasurementForm = ({ onSuccess }: AddBodyMeasurementFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [biceps, setBiceps] = useState("");
  const [thighs, setThighs] = useState("");

  const resetForm = () => {
    setWeight("");
    setBodyFat("");
    setChest("");
    setWaist("");
    setHips("");
    setBiceps("");
    setThighs("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add measurements",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one measurement is provided
    if (!weight && !bodyFat && !chest && !waist && !hips && !biceps && !thighs) {
      toast({
        title: "Error",
        description: "Please provide at least one measurement",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for insertion
      const measurementData = {
        user_id: user.id,
        date: new Date().toISOString(),
        weight: weight ? parseFloat(weight) : null,
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        biceps: biceps ? parseFloat(biceps) : null,
        thighs: thighs ? parseFloat(thighs) : null,
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('body_measurements')
        .insert([measurementData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Body measurements added successfully",
      });
      
      resetForm();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding body measurements:", error);
      toast({
        title: "Error adding measurements",
        description: "There was a problem saving your measurements.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Add Measurements
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Body Measurements</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 165.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFat">Body Fat %</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15.5"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chest">Chest (in)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 42.5"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist">Waist (in)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 32.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hips">Hips (in)</Label>
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38.5"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biceps">Biceps (in)</Label>
                <Input
                  id="biceps"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 14.5"
                  value={biceps}
                  onChange={(e) => setBiceps(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thighs">Thighs (in)</Label>
              <Input
                id="thighs"
                type="number"
                step="0.1"
                placeholder="e.g. 22.5"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Measurements"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBodyMeasurementForm;
