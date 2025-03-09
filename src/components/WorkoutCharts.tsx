
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExerciseProgress {
  id: string;
  exercise_id: string;
  exercise_name: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
}

interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  body_fat_percentage: number;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
}

interface Exercise {
  id: string;
  name: string;
}

// Sample data for demonstration
const sampleExerciseProgress: ExerciseProgress[] = [
  { id: '1', exercise_id: '1', exercise_name: 'Bench Press', date: 'Mar 01', weight: 135, reps: 8, sets: 3 },
  { id: '2', exercise_id: '1', exercise_name: 'Bench Press', date: 'Mar 08', weight: 145, reps: 8, sets: 3 },
  { id: '3', exercise_id: '1', exercise_name: 'Bench Press', date: 'Mar 15', weight: 155, reps: 8, sets: 3 },
  { id: '4', exercise_id: '1', exercise_name: 'Bench Press', date: 'Mar 22', weight: 165, reps: 6, sets: 3 },
  { id: '5', exercise_id: '1', exercise_name: 'Bench Press', date: 'Mar 29', weight: 175, reps: 5, sets: 3 },
];

const sampleBodyMeasurements: BodyMeasurement[] = [
  { id: '1', date: 'Mar 01', weight: 180, body_fat_percentage: 18, chest: 42, waist: 34, hips: 40, biceps: 14, thighs: 22 },
  { id: '2', date: 'Mar 08', weight: 178, body_fat_percentage: 17.5, chest: 42, waist: 33.5, hips: 40, biceps: 14.2, thighs: 22 },
  { id: '3', date: 'Mar 15', weight: 177, body_fat_percentage: 17, chest: 42, waist: 33, hips: 40, biceps: 14.4, thighs: 22.2 },
  { id: '4', date: 'Mar 22', weight: 175, body_fat_percentage: 16.5, chest: 42.5, waist: 32.5, hips: 39.5, biceps: 14.6, thighs: 22.4 },
  { id: '5', date: 'Mar 29', weight: 173, body_fat_percentage: 16, chest: 43, waist: 32, hips: 39, biceps: 15, thighs: 22.6 },
];

const sampleExercises: Exercise[] = [
  { id: '1', name: 'Bench Press' },
  { id: '2', name: 'Squat' },
  { id: '3', name: 'Deadlift' },
  { id: '4', name: 'Pull-up' },
  { id: '5', name: 'Shoulder Press' },
];

const WorkoutCharts = () => {
  const [activeTab, setActiveTab] = useState("exercise-progress");
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedExercise, setSelectedExercise] = useState<string>("1");
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [selectedBodyMetric, setSelectedBodyMetric] = useState("weight");
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>(sampleExerciseProgress);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(sampleBodyMeasurements);
  const [exercises, setExercises] = useState<Exercise[]>(sampleExercises);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // In a real implementation, we would fetch data from Supabase here
  useEffect(() => {
    // This would be replaced with actual data fetching once the tables are created
    setExercises(sampleExercises);
    setExerciseProgress(sampleExerciseProgress);
    setBodyMeasurements(sampleBodyMeasurements);
  }, []);

  // Get the appropriate data for the selected metric
  const getChartData = () => {
    if (activeTab === "exercise-progress") {
      return exerciseProgress;
    } else {
      return bodyMeasurements;
    }
  };

  // Get the appropriate metric for the chart
  const getMetricKey = () => {
    if (activeTab === "exercise-progress") {
      return selectedMetric;
    } else {
      return selectedBodyMetric;
    }
  };

  // Get the label for the selected metric
  const getMetricLabel = () => {
    const metricMap: Record<string, string> = {
      weight: "Weight (lbs)",
      reps: "Repetitions",
      sets: "Sets",
      body_fat_percentage: "Body Fat %",
      chest: "Chest (in)",
      waist: "Waist (in)",
      hips: "Hips (in)",
      biceps: "Biceps (in)",
      thighs: "Thighs (in)"
    };

    return metricMap[getMetricKey()] || getMetricKey();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Progress Charts</CardTitle>
        <CardDescription>Track your fitness progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercise-progress">Exercise Progress</TabsTrigger>
            <TabsTrigger value="body-measurements">Body Measurements</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="w-full md:w-1/3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab === "exercise-progress" && (
              <>
                <div className="w-full md:w-1/3">
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger>
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
                <div className="w-full md:w-1/3">
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="reps">Repetitions</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "body-measurements" && (
              <div className="w-full md:w-1/3">
                <Select value={selectedBodyMetric} onValueChange={setSelectedBodyMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="body_fat_percentage">Body Fat %</SelectItem>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="waist">Waist</SelectItem>
                    <SelectItem value="hips">Hips</SelectItem>
                    <SelectItem value="biceps">Biceps</SelectItem>
                    <SelectItem value="thighs">Thighs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="exercise-progress" className="mt-4">
            <div className="h-[300px] w-full mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={getMetricKey()}
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="body-measurements" className="mt-4">
            <div className="h-[300px] w-full mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={getMetricKey()}
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutCharts;
