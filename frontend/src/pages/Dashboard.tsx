import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectsApi, timeEntriesApi, usersApi } from '../services/api';
import { Project, TimeEntry, User } from '../types';
import { Clock, FolderOpen, Users, TrendingUp, Calendar, Award } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardStats { }

export const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({

  });
  const [recentTimeEntries, setRecentTimeEntries] = useState<TimeEntry[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          const [projectsRes, usersRes, timeEntriesRes] = await Promise.all([
            projectsApi.getAll(),
            usersApi.getAll(),
            timeEntriesApi.getAll(),
          ]);

          const projects = projectsRes.data;
          const users = usersRes.data;
          const timeEntries = timeEntriesRes.data;

          const now = new Date();
          const weekStart = startOfWeek(now);
          const weekEnd = endOfWeek(now);
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);

          const thisWeekEntries = timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate <= weekEnd;
          });

          const thisMonthEntries = timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= monthStart && entryDate <= monthEnd;
          });

          setStats({
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            totalUsers: users.filter(u => u.role === 'user').length,
            thisWeekHours: thisWeekEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0),
            thisMonthHours: thisMonthEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0),
            completedProjects: projects.filter(p => p.status === 'completed').length,
          });

          setRecentTimeEntries(timeEntries.slice(-5).reverse());
          setAllProjects(projects);
        } else {
          // Fetch projects first (this is the critical part for showing projects)
          try {
            const projectsRes = await projectsApi.getAll();
            const allProjects = projectsRes.data;
            
            // ✅ Filter projects where user is assigned
            const assignedProjects = allProjects?.filter((project: any) => {
              const isAssigned = project.assignedUsers?.includes(user!.id);
              return isAssigned;
            }) || [];
            
            // ✅ Set the filtered projects instead of all projects
            setUserProjects(assignedProjects);
          } catch (projectsError) {
            console.error("Failed to fetch projects:", projectsError);
          }

          // Fetch time entries separately (don't let this fail the projects)
          try {
            const timeEntriesRes = await timeEntriesApi.getByUser(user!.id);
            const timeEntries = timeEntriesRes.data;
            setRecentTimeEntries(timeEntries?.slice(-5).reverse() || []);
          } catch (timeEntriesError) {
            console.error("Failed to fetch time entries:", timeEntriesError);
            // Don't fail the whole component if time entries fail
            setRecentTimeEntries([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, user]);

  const getProjectName = (projectId: any) => {
    const project = isAdmin
      ? allProjects.find(p => p._id === projectId.id)
      : userProjects.find(p => p._id === projectId.id);
    return project?.title || 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      icon: FolderOpen,
      color: 'bg-blue-500',
    },
    {
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    ...(isAdmin ? [{

      icon: Users,
      color: 'bg-purple-500',
    }] : []),
    {
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      icon: Calendar,
      color: 'bg-indigo-500',
    },
    {
      icon: Award,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-10 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isAdmin ? 'Project Overview' : 'My Projects'}
            </h3>

            <div className="mt-6 space-y-4">
              {(() => {
                const projectsToShow = isAdmin ? allProjects : userProjects;
                
                return projectsToShow?.slice(0, 5).map((project) => {
                  return (
                    <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {project.title}
                        </p> 
                        <p className="text-sm text-gray-500">
                          {project.description}
                        </p>
                        {project.endDate && (
                          <p className="text-xs text-gray-400">
                            Due: {format(new Date(project.endDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}

              {(() => {
                const projectsToShow = isAdmin ? allProjects : userProjects;
                if (!projectsToShow || projectsToShow.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No projects available.
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};