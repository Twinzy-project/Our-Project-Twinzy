import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, GoalStatistics, CategoryCount } from "@shared/schema";
import { auth } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { GoalTable } from "@/components/GoalTable";
import { GoalForm } from "@/components/GoalForm";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from backend
          const response = await fetch(`/api/auth/user/${firebaseUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // If user doesn't exist in backend, create it
            const createResponse = await fetch('/api/auth/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email || `${firebaseUser.uid}@anonymous.user`,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                photoURL: firebaseUser.photoURL || '',
              }),
            });
            
            if (createResponse.ok) {
              const newUserData = await createResponse.json();
              setUser(newUserData);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setLocation("/login");
      }
    });
    
    return () => unsubscribe();
  }, [setLocation]);
  
  // Fetch goals
  const { data: goals, isLoading: isLoadingGoals } = useQuery({
    queryKey: user ? [`/api/goals/${user.uid}`] : null,
    enabled: !!user,
  });
  
  // Fetch statistics
  const { data: statistics, isLoading: isLoadingStats } = useQuery<GoalStatistics>({
    queryKey: user ? [`/api/statistics/${user.uid}`] : null,
    enabled: !!user,
  });
  
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<CategoryCount[]>({
    queryKey: user ? [`/api/categories/${user.uid}`] : null,
    enabled: !!user,
  });
  
  // Initialize charts
  useEffect(() => {
    let progressChart: Chart | null = null;
    let categoriesChart: Chart | null = null;
    
    if (user && !isLoadingGoals && !isLoadingCategories) {
      // Clean up previous charts
      if (progressChart) progressChart.destroy();
      if (categoriesChart) categoriesChart.destroy();
      
      // Progress Chart
      const progressCtx = document.getElementById('progressChart') as HTMLCanvasElement;
      if (progressCtx) {
        progressChart = new Chart(progressCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Goals Completed',
              data: [3, 5, 4, 6, 8, 7], // Mock data for demonstration
              borderColor: '#8A2BE2',
              backgroundColor: 'rgba(138, 43, 226, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
      
      // Categories Chart
      const categoriesCtx = document.getElementById('categoriesChart') as HTMLCanvasElement;
      if (categoriesCtx && categories && categories.length > 0) {
        categoriesChart = new Chart(categoriesCtx, {
          type: 'doughnut',
          data: {
            labels: categories.map(cat => cat.category),
            datasets: [{
              data: categories.map(cat => cat.count),
              backgroundColor: [
                '#8A2BE2', // Primary
                '#E6D0FF', // Secondary
                '#FAD0DC', // Accent
                '#f6c23e', // Warning
                '#5a5c69', // Dark
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            },
            cutout: '65%'
          }
        });
      }
    }
    
    return () => {
      if (progressChart) progressChart.destroy();
      if (categoriesChart) categoriesChart.destroy();
    };
  }, [user, categories, isLoadingGoals, isLoadingCategories]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-accent p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-accent p-4">
      <Navbar user={user} />
      
      <div className="container mx-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-600">Here's an overview of your goals and progress.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-lg overflow-hidden">
                <div className={`h-1 bg-primary`}></div>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard 
                title="Total Goals" 
                value={statistics?.totalGoals || 0} 
                trend={{ direction: "up", value: "25%" }} 
                borderColor="bg-primary" 
              />
              <StatCard 
                title="Goals Completed" 
                value={statistics?.completedGoals || 0} 
                trend={{ direction: "up", value: "15%" }} 
                borderColor="bg-secondary" 
              />
              <StatCard 
                title="In Progress" 
                value={statistics?.inProgressGoals || 0} 
                trend={{ direction: "down", value: "5%" }} 
                borderColor="bg-accent" 
              />
              <StatCard 
                title="Completion Rate" 
                value={`${statistics?.completionRate || 0}%`} 
                trend={{ direction: "up", value: "10%" }} 
                borderColor="bg-warning" 
              />
            </>
          )}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-dark border-b pb-4 mb-4">Goal Progress</h3>
              <div className="h-64">
                {isLoadingGoals ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <canvas id="progressChart"></canvas>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-dark border-b pb-4 mb-4">Goal Categories</h3>
              <div className="h-64">
                {isLoadingCategories ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : categories && categories.length > 0 ? (
                  <canvas id="categoriesChart"></canvas>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No categories found. Create your first goal!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Goals Section */}
        <Card className="rounded-2xl shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-dark">Your Goals</h3>
              <Button 
                onClick={() => setIsAddGoalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Goal
              </Button>
            </div>
            
            {isLoadingGoals ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <GoalTable goals={goals || []} userId={user.uid} />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <GoalForm 
            userId={user.uid} 
            onSuccess={() => setIsAddGoalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
