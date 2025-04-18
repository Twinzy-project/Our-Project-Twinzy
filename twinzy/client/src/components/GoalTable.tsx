import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GoalForm } from "./GoalForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GoalTableProps {
  goals: Goal[];
  userId: string;
}

export function GoalTable({ goals, userId }: GoalTableProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleDelete = async () => {
    if (!selectedGoal) return;
    
    try {
      await apiRequest("DELETE", `/api/goals/${selectedGoal.id}`, undefined);
      
      toast({
        title: "Goal deleted",
        description: "Your goal has been successfully deleted.",
      });
      
      // Invalidate and refetch goals
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${userId}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedGoal(null);
    }
  };

  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const getDaysRemaining = (deadline: Date | null) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <div className="text-xs text-red-600">Overdue by {Math.abs(diffDays)} days</div>;
    } else if (diffDays === 0) {
      return <div className="text-xs text-orange-600">Due today</div>;
    } else {
      return <div className="text-xs text-green-600">{diffDays} days left</div>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const getCategoryBadgeClass = (category: string) => {
    const categories: Record<string, string> = {
      'Education': 'bg-blue-100 text-blue-800',
      'Health': 'bg-green-100 text-green-800',
      'Career': 'bg-purple-100 text-purple-800',
      'Personal': 'bg-yellow-100 text-yellow-800',
      'Finance': 'bg-emerald-100 text-emerald-800',
    };
    
    return categories[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 bg-primary text-white text-left rounded-tl-lg">Goal</th>
              <th className="py-3 px-4 bg-primary text-white text-left">Category</th>
              <th className="py-3 px-4 bg-primary text-white text-left">Deadline</th>
              <th className="py-3 px-4 bg-primary text-white text-left">Progress</th>
              <th className="py-3 px-4 bg-primary text-white text-left rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No goals found. Create your first goal!
                </td>
              </tr>
            ) : (
              goals.map((goal) => (
                <tr key={goal.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-sm text-gray-500">{goal.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 ${getCategoryBadgeClass(goal.category)} rounded-full text-xs`}>
                      {goal.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-700">{formatDate(goal.deadline)}</div>
                    {goal.deadline && getDaysRemaining(goal.deadline)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{goal.progress}% completed</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEditModal(goal)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => openDeleteDialog(goal)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <h3 className="text-xl font-semibold mb-4">Edit Goal</h3>
          {selectedGoal && (
            <GoalForm 
              userId={userId} 
              initialData={selectedGoal} 
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your goal 
              "{selectedGoal?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
