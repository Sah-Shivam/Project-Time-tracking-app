import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { timeEntriesApi, projectsApi } from '../services/api';
import { TimeEntry, Project } from '../types';
import { Plus, Clock, Calendar, Edit, Search } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, ] = await Promise.all([
        timeEntriesApi.getByUser(user!._id),
        
      ]);
      setTimeEntries(entriesRes.data);
      ;
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    let filtered = timeEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getProjectName(entry.project).toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (dateFilter === 'all') return true;
      
      const entryDate = new Date(entry.date);
      const now = new Date();
      
      if (dateFilter === 'week') {
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return entryDate >= weekStart && entryDate <= weekEnd;
      }
      
      if (dateFilter === 'month') {
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      }
      
      return true;
    });

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getProjectName = (project: any) => {
   
    return project?.title || 'Unknown Project';
  };

  const getTotalHours = () => {
    return getFilteredEntries().reduce((sum, entry) => sum + entry.hoursWorked, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredEntries = getFilteredEntries();

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your working hours across projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Log Time
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">
                Total Hours ({dateFilter === 'all' ? 'All Time' : dateFilter === 'week' ? 'This Week' : 'This Month'})
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {getTotalHours()}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search time entries..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEntries.map((entry) => (
            <li key={entry.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.description}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {entry.hoursWorked}h
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {getProjectName(entry.project)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-blue-600 hover:text-blue-500 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateFilter !== 'all' 
                ? 'No entries match your filters.'
                : 'Get started by logging your first time entry.'}
            </p>
            {!searchTerm && dateFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Log Time
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEntry) && (
        <TimeEntryModal
          entry={editingEntry}
          projects={projects}
          isOpen={showCreateModal || !!editingEntry}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEntry(null);
          }}
          onSave={() => {
            fetchData();
            setShowCreateModal(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

interface TimeEntryModalProps {
  entry: TimeEntry | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ 
  entry, 
  projects, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    project: '',
    description: '',
    hoursWorked:'',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        project: entry.project,
        description: entry.description,
        hoursWorked: entry.hoursWorked.toString(),
        date: entry.date,
      });
    } else {
      setFormData({
        project: projects.length > 0 ? projects[0]._id : '',
        description: '',
        hoursWorked: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [entry, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const entryData = {
        userId: user!._id,
        project: formData.project,
        description: formData.description,
        hoursWorked: parseFloat(formData.hoursWorked),
        date: formData.date,
      };

      await timeEntriesApi.create(entryData);
      onSave();
    } catch (error) {
      console.error('Failed to save time entry:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {entry ? 'Edit Time Entry' : 'Log Time Entry'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={3}
                placeholder="What did you work on?"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="number"
                required
                min="0.25"
                max="24"
                step="0.25"
                placeholder="0.5"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (entry ? 'Update' : 'Log Time')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};