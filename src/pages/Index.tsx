
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Award, Calendar, ChevronUp, Dumbbell, LineChart } from "lucide-react";
import AddWorkoutForm from "@/components/AddWorkoutForm";
import AddRecordForm from "@/components/AddRecordForm";
import WorkoutDetails from "@/components/WorkoutDetails";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">FitTrack</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Welcome back!</span>
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
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">PRs This Month</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Bench Press, Squat, Deadlift</p>
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
                <div className="space-y-4">
                  {recentWorkouts.map((workout, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">{workout.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">{workout.duration} • {workout.exercises} exercises</div>
                        <WorkoutDetails workout={{
                          ...workout,
                          intensity: "Moderate",
                          exercises: ["Exercise 1", "Exercise 2", "Exercise 3"]
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {workoutHistory.map((workout, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">{workout.date}</p>
                        <p className="text-sm mt-1">{workout.exercises.join(", ")}</p>
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
                <div className="space-y-4">
                  {personalRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{record.exercise}</p>
                        <p className="text-sm text-muted-foreground">Achieved on {record.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold">{record.value}</p>
                          <p className="text-xs text-muted-foreground">{record.previous && `Previous: ${record.previous}`}</p>
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

// Sample data (will be replaced with actual data from Supabase later)
const recentWorkouts = [
  { name: "Upper Body Strength", date: "Today", duration: "45 min", exercises: 5 },
  { name: "Leg Day", date: "Yesterday", duration: "60 min", exercises: 6 },
  { name: "HIIT Cardio", date: "3 days ago", duration: "30 min", exercises: 8 },
  { name: "Back & Biceps", date: "5 days ago", duration: "50 min", exercises: 7 },
  { name: "Core Workout", date: "1 week ago", duration: "25 min", exercises: 4 },
];

const workoutHistory = [
  { 
    name: "Upper Body Strength", 
    date: "Today", 
    duration: "45 min", 
    intensity: "Moderate",
    exercises: ["Bench Press", "Shoulder Press", "Tricep Extensions", "Push-ups", "Dips"] 
  },
  { 
    name: "Leg Day", 
    date: "Yesterday", 
    duration: "60 min", 
    intensity: "High",
    exercises: ["Squats", "Deadlifts", "Lunges", "Leg Press", "Calf Raises", "Leg Extensions"] 
  },
  { 
    name: "HIIT Cardio", 
    date: "3 days ago", 
    duration: "30 min", 
    intensity: "Very High",
    exercises: ["Burpees", "Mountain Climbers", "Jump Squats", "High Knees", "Jumping Jacks"] 
  },
  { 
    name: "Back & Biceps", 
    date: "5 days ago", 
    duration: "50 min", 
    intensity: "Moderate",
    exercises: ["Pull-ups", "Barbell Rows", "Bicep Curls", "Lat Pulldowns", "Face Pulls"] 
  },
  { 
    name: "Core Workout", 
    date: "1 week ago", 
    duration: "25 min", 
    intensity: "Low",
    exercises: ["Planks", "Russian Twists", "Leg Raises", "Crunches"] 
  },
];

const personalRecords = [
  { exercise: "Bench Press", value: "225 lbs", date: "Today", previous: "215 lbs", isNew: true },
  { exercise: "Squat", value: "315 lbs", date: "Last week", previous: "305 lbs", isNew: true },
  { exercise: "Deadlift", value: "405 lbs", date: "2 weeks ago", previous: "385 lbs", isNew: true },
  { exercise: "Pull-ups", value: "15 reps", date: "3 weeks ago", previous: "12 reps", isNew: false },
  { exercise: "5K Run", value: "22:15", date: "1 month ago", previous: "23:30", isNew: false },
];

export default Index;
