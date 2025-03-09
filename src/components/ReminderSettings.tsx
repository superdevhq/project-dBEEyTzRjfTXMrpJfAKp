
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

interface ReminderSettingsProps {
  className?: string;
}

const ReminderSettings = ({ className }: ReminderSettingsProps) => {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00"); // Default to 8 PM
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate time options for the dropdown (every 30 minutes)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const hourFormatted = hour.toString().padStart(2, "0");
    const minuteFormatted = minute.toString().padStart(2, "0");
    const value = `${hourFormatted}:${minuteFormatted}`;
    
    // Format for display (12-hour clock with AM/PM)
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    const label = `${hour12}:${minuteFormatted} ${ampm}`;
    
    return { value, label };
  });

  // Fetch user's current reminder settings
  useEffect(() => {
    const fetchReminderSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("reminder_enabled, reminder_time")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setReminderEnabled(data.reminder_enabled || false);
          
          // Convert time from database format (HH:MM:SS) to input format (HH:MM)
          if (data.reminder_time) {
            const timeWithoutSeconds = data.reminder_time.substring(0, 5);
            setReminderTime(timeWithoutSeconds);
          }
        }
      } catch (error) {
        console.error("Error fetching reminder settings:", error);
        toast({
          title: "Error",
          description: "Failed to load your reminder settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderSettings();
  }, [user, toast]);

  // Save reminder settings
  const saveReminderSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          reminder_enabled: reminderEnabled,
          reminder_time: reminderTime + ":00", // Add seconds for database format
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: reminderEnabled 
          ? "You'll receive daily workout reminders" 
          : "Workout reminders have been disabled",
      });
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      toast({
        title: "Error",
        description: "Failed to save your reminder settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Workout Reminders
        </CardTitle>
        <CardDescription>
          Get daily reminders to log your workouts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-toggle" className="font-medium">
                Daily Workout Reminders
              </Label>
              <Switch
                id="reminder-toggle"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>
            
            {reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Select
                  value={reminderTime}
                  onValueChange={setReminderTime}
                  disabled={!reminderEnabled}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll receive a reminder email at this time if you haven't logged a workout for the day.
                </p>
              </div>
            )}
            
            <Button 
              onClick={saveReminderSettings} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;
