
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const AddMeasurementForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [chest, setChest] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [hips, setHips] = useState<string>("");
  const [biceps, setBiceps] = useState<string>("");
  const [thighs, setThighs] = useState<string>("");

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
        description: "Please enter at least one measurement",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          date: date.toISOString(),
          weight: weight ? parseFloat(weight) : null,
          body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
          chest: chest ? parseFloat(chest) : null,
          waist: waist ? parseFloat(waist) : null,
          hips: hips ? parseFloat(hips) : null,
          biceps: biceps ? parseFloat(biceps) : null,
          thighs: thighs ? parseFloat(thighs) : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Measurements added successfully",
      });

      // Reset form
      setDate(new Date());
      setWeight("");
      setBodyFat("");
      setChest("");
      setWaist("");
      setHips("");
      setBiceps("");
      setThighs("");
      
      // Navigate to charts page
      navigate("/charts");
    } catch (error) {
      console.error('Error adding measurements:', error);
      toast({
        title: "Error",
        description: "Failed to add measurements",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Body Measurements</CardTitle>
        <CardDescription>Track your body measurements over time</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyFat">Body Fat Percentage (%)</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="Enter body fat percentage"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chest">Chest (in)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="Chest measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Waist (in)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="Waist measurement"
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
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="Hips measurement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biceps">Biceps (in)</Label>
              <Input
                id="biceps"
                type="number"
                step="0.1"
                value={biceps}
                onChange={(e) => setBiceps(e.target.value)}
                placeholder="Biceps measurement"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thighs">Thighs (in)</Label>
            <Input
              id="thighs"
              type="number"
              step="0.1"
              value={thighs}
              onChange={(e) => setThighs(e.target.value)}
              placeholder="Thighs measurement"
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save Measurements"}
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

export default AddMeasurementForm;
