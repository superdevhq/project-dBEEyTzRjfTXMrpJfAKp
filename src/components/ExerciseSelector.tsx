
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  description?: string;
}

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseSelector = ({ open, onOpenChange, onSelectExercise }: ExerciseSelectorProps) => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setExercises(data);
        setFilteredExercises(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(ex => ex.category)));
        setCategories(["All", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error loading exercises",
        description: "There was a problem loading the exercise library.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter exercises based on search query and selected category
    let filtered = exercises;
    
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }
    
    setFilteredExercises(filtered);
  }, [searchQuery, selectedCategory, exercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select an Exercise</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Exercise grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="flex flex-col p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectExercise(exercise)}
                >
                  <h3 className="font-medium">{exercise.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {exercise.category}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                      {exercise.muscle_group}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No exercises found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseSelector;
