
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Award, Calendar, ChevronUp, Dumbbell, LineChart, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AddWorkoutForm from "@/components/AddWorkoutForm";
import AddRecordForm from "@/components/AddRecordForm";
import WorkoutDetails from "@/components/WorkoutDetails";

// Types for our data
interface Exercise {
  id?: string;
  workout_id?: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface Workout {
  id?: string;
  user_id?: string;
  name: string;
  date: string;
  duration: string;
  intensity: string;
  exercises: string[] | Exercise[];
  notes?: string;
}

interface PersonalRecord {
  id?: string;
  user_id?: string;
  exercise: string;
  value: string;
  date: string;
  previous_value?: string;
  isNew: boolean;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount or when user changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (workoutsError) throw workoutsError;

      // Fetch exercises for each workout
      const workoutsWithExercises = await Promise.all(
        (workoutsData || []).map(async (workout) => {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);

          if (exercisesError) throw exercisesError;

          // Format date for display
          const date = new Date(workout.date);
          const formattedDate = isToday(date) 
            ? 'Today' 
            : isYesterday(date) 
              ? 'Yesterday' 
              : date.toLocaleDateString();

          return {
            ...workout,
            date: formattedDate,
            exercises: exercisesData || []
          };
        })
      );

      setWorkouts(workoutsWithExercises || []);

      // Fetch personal records
      const { data: recordsData, error: recordsError } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;

      const formattedRecords = (recordsData || []).map(record => {
        // Format date for display
        const date = new Date(record.date);
        const formattedDate = isToday(date) 
          ? 'Today' 
          : isYesterday(date) 
            ? 'Yesterday' 
            : date.toLocaleDateString();

        return {
          ...record,
          date: formattedDate,
          previous: record.previous_value,
          isNew: isWithinLastMonth(date)
        };
      });

      setRecords(formattedRecords || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading your fitness data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  // Helper functions for date formatting
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const isWithinLastMonth = (date: Date) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return date >= oneMonthAgo;
  };

  // Get recent workouts (last 5)
  const recentWorkouts = workouts.slice(0, 5).map(workout => ({
    ...workout,
    exercises: workout.exercises || []
  }));

  // Count new PRs this month
  const newPRsThisMonth = records.filter(r => r.isNew);

  // Empty state component
  const EmptyState = ({ type, action }: { type: string, action: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Plus className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">No {type} yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Start tracking your fitness journey by adding your first {type.toLowerCase()}.
      </p>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">FitTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.email?.split('@')[0]}!
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workouts.length}</div>
              <p className="text-xs text-muted-foreground">
                {workouts.length === 0 
                  ? "No workouts recorded yet" 
                  : "Your lifetime workouts"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workouts.length === 0 ? "0 days" : "7 days"}
              </div>
              <p className="text-xs text-muted-foreground">
                {workouts.length === 0 
                  ? "Start your streak today" 
                  : "Keep it up!"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">PRs This Month</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newPRsThisMonth.length}</div>
              <p className="text-xs text-muted-foreground">
                {newPRsThisMonth.length > 0 
                  ? newPRsThisMonth.slice(0, 3).map(r => r.exercise).join(", ") 
                  : "Set a new record!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-6 gap-2">
          <AddRecordForm />
          <AddWorkoutForm />
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workouts">Workout History</TabsTrigger>
            <TabsTrigger value="records">Personal Records</TabsTrigger>
            <TabsTrigger value="progress">Progress Charts</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your last 5 workouts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : recentWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {recentWorkouts.map((workout, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">{workout.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            {workout.duration} • {Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercises
                          </div>
                          <WorkoutDetails workout={workout} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    type="Workouts" 
                    action={<AddWorkoutForm />} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workout History Tab */}
          <TabsContent value="workouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>All your recorded workouts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : workouts.length > 0 ? (
                  <div className="space-y-4">
                    {workouts.map((workout, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">{workout.date}</p>
                          <p className="text-sm mt-1">
                            {Array.isArray(workout.exercises) && workout.exercises.length > 0
                              ? typeof workout.exercises[0] === 'string'
                                ? (workout.exercises as string[]).join(", ")
                                : (workout.exercises as Exercise[]).map(e => e.name).join(", ")
                              : "No exercises recorded"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm text-right">
                            <p>{workout.duration}</p>
                            <p className="text-muted-foreground">{workout.intensity}</p>
                          </div>
                          <WorkoutDetails workout={workout} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    type="Workouts" 
                    action={<AddWorkoutForm />} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
                <CardDescription>Your best performances</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map((record, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">{record.exercise}</p>
                          <p className="text-sm text-muted-foreground">Achieved on {record.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold">{record.value}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.previous_value && `Previous: ${record.previous_value}`}
                            </p>
                          </div>
                          {record.isNew && (
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <ChevronUp className="h-3 w-3 mr-1" />
                              New
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    type="Records" 
                    action={<AddRecordForm />} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Charts Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>Track your improvements</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Progress Charts Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Visual progress tracking will be available once you've logged more workouts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
