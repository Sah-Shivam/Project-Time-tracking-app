import React, { useState, useEffect } from 'react';
import { timeEntriesApi, usersApi, projectsApi, reportsApi } from '../services/api';
import { TimeEntry, User, Project, ReportFilters } from '../types';
import { Download, Filter,  } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import jsPDF from 'jspdf';



export const Reports: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [reportData, setReportData] = useState<any>({});
  
   useEffect(() => {
    const fetchReport = async () => {
      if (filters.month && filters.year) {
        try {
          const res = await reportsApi.generate({
            userId: filters.userId,
            month: filters.month?.toString(), 
            year: filters.year?.toString(),
          });
          if (res.success) {
             console.log("Fetched report data:", res.data); 
            setReportData(res.data);
          }
        } catch (err) {
          console.error('Error fetching report:', err); 
        }
      }
    };
    fetchReport();
  }, [filters.month, filters.year, filters.userId]);
 
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (dateRange !== 'custom') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (dateRange === 'week') {
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      setFilters({
        ...filters,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });  
    }
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, usersRes, projectsRes] = await Promise.all([
        timeEntriesApi.getAll(),
        usersApi.getAll(),
        projectsApi.getAll(),
      ]);

      setTimeEntries(entriesRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    return timeEntries.filter(entry => {
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.projectId && entry.project_id !== filters.projectId) return false;
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      return true;
    });
  };

  const getChartData = () => {
    const filteredEntries = getFilteredEntries();
    const projectData: { [key: string]: number } = {};
    const userProjectData: { [key: string]: { [key: string]: number } } = {};

    filteredEntries.forEach(entry => {
      const project = projects.find(p => p._id === entry.project._id);
      const user = users.find(u => u._id === entry.userId);

      if (project) {
        projectData[project.title] = (projectData[project.title] || 0) + entry.hoursWorked;
      }

      if (user && project) {
        if (!userProjectData[user.name]) {
          userProjectData[user.name] = {};
        }
        userProjectData[user.name][project.title] =
          (userProjectData[user.name][project.title] || 0) + entry.hoursWorked;
      }
    });

    const barData = Object.entries(projectData).map(([name, hoursWorked]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      hoursWorked,
    }));

    const pieData = Object.entries(projectData).map(([name, hoursWorked]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      value: hoursWorked,
    }));

    return { barData, pieData, userProjectData };
  };

  const getTotalhoursWorked = () => {
    return getFilteredEntries().reduce((sum, entry) => sum + entry.hoursWorked, 0);
  };

  const getUniqueUsersCount = () => {
    const userIds = new Set(getFilteredEntries().map(entry => entry.userId));
    return userIds.size;
  };

  const getUniqueProjectsCount = () => {
    const projectIds = new Set(getFilteredEntries().map(entry => entry.projectId));
    return projectIds.size;
  };


  console.log('reportData at export:', reportData);
const exportToPDF = () => {
  const doc = new jsPDF();
  const downloadDate = format(new Date(), 'yyyy-MM-dd');
  const downloadTime = format(new Date(), 'Ppp');

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Time Tracking Report', 20, 20);

  // Table Headers
  let yPos = 40;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Name', 20, yPos);
  doc.text('Project', 80, yPos);
  doc.text('Time (hrs)', 150, yPos);

  yPos += 10;

  // Filter only project data
  const data = Object.fromEntries(
    Object.entries(reportData).filter(
      ([key]) => !['filtersUsed', 'totalEntries', 'reportGeneratedAt'].includes(key)
    )
  );

  doc.setFont('helvetica', 'normal');

  Object.entries(data).forEach(([projectName, usersMap]: any) => {
    Object.entries(usersMap).forEach(([userName, hours]: any) => {
      doc.text(userName, 20, yPos);
      doc.text(projectName, 80, yPos);
      doc.text(`${hours}h`, 150, yPos);
      yPos += 10;

      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
    });
  });

  yPos += 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text(
    `Generated At: ${
      reportData.reportGeneratedAt && !isNaN(new Date(reportData.reportGeneratedAt).getTime())
        ? format(new Date(reportData.reportGeneratedAt), 'Ppp')
        : downloadTime
    }`,
    20,
    yPos
  );

  doc.save(`time-report-${downloadDate}.pdf`);
};



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { barData, pieData } = getChartData();

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze time tracking data and generate reports
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.userId || ''}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
            >
              <option value="">All Users</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.projectId || ''}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              value={filters.month || ''}
              onChange={(e) => {
                const month = parseInt(e.target.value, 10);
                const year = filters.year ? parseInt(filters.year, 10) : new Date().getFullYear();

                const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
                const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
                setFilters({ ...filters, month: e.target.value, startDate, endDate });
              }}
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              value={filters.year || ''}
              onChange={(e) => {
                const year = parseInt(e.target.value, 10);
                if (filters.month) {
                  const month = parseInt(filters.month, 10) - 1;
                  const startDate = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd');
                  const endDate = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd');
                  setFilters({ ...filters, year: e.target.value, startDate, endDate });
                } else {
                  setFilters({ ...filters, year: e.target.value });
                }
              }}
            >
              <option value="">Select Year</option>
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
     
      
      {reportData && Object.keys(reportData).length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Report Summary</h2>
          {Object.entries(reportData).map(([projectName, userMap]: any) => (
            <div key={projectName} className="mb-4">
              <h3 className="text-lg font-semibold text-blue-600">{projectName}</h3>
              <ul className="pl-4 list-disc text-sm text-gray-700">
                {Object.entries(userMap).map(([userName, totalHours]: any) => (
                  <li key={userName}>
                    {userName}: <strong>{totalHours}h</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      

      {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total hoursWorked
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getTotalhoursWorked()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getUniqueUsersCount()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getUniqueProjectsCount()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div> */}



      {/* Detailed Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detailed Time Entries
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Complete list of filtered time entries
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    hoursWorked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredEntries().map((entry) => {
                  const user = users.find(u => u.id === entry.userId);
                  const project = projects.find(p => p.id === entry.projectId);

                  return (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.hoursWorked}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {getFilteredEntries().length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  No time entries match the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};