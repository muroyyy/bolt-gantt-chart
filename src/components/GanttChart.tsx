import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, Calendar, BarChart3 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Task {
  id: string;
  name: string;
  phase: string;
  startDate: Date;
  endDate: Date;
  predecessor?: string;
  duration: number;
}

const phases = [
  { value: 'initiating', label: 'Initiating', color: 'bg-blue-100 text-blue-800' },
  { value: 'planning', label: 'Planning', color: 'bg-green-100 text-green-800' },
  { value: 'executing', label: 'Executing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'monitoring', label: 'Monitoring', color: 'bg-purple-100 text-purple-800' },
  { value: 'closing', label: 'Closing', color: 'bg-red-100 text-red-800' }
];

const phaseColors = {
  initiating: 'bg-blue-500',
  planning: 'bg-green-500',
  executing: 'bg-yellow-500',
  monitoring: 'bg-purple-500',
  closing: 'bg-red-500'
};

export default function GanttChart() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phase: 'initiating',
    startDate: new Date(),
    endDate: new Date(),
    predecessor: ''
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  const calculateDuration = (startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const addTask = () => {
    if (!formData.name.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      name: formData.name,
      phase: formData.phase,
      startDate: formData.startDate,
      endDate: formData.endDate,
      predecessor: formData.predecessor || undefined,
      duration: calculateDuration(formData.startDate, formData.endDate)
    };

    setTasks([...tasks, newTask]);
    setFormData({
      name: '',
      phase: 'initiating',
      startDate: new Date(),
      endDate: new Date(),
      predecessor: ''
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditData({
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      predecessor: task.predecessor || ''
    });
  };

  const saveEdit = () => {
    if (!editingTask) return;

    setTasks(tasks.map(task => {
      if (task.id === editingTask) {
        const updatedTask = {
          ...task,
          ...editData,
          duration: editData.startDate && editData.endDate 
            ? calculateDuration(editData.startDate, editData.endDate)
            : task.duration
        };
        return updatedTask;
      }
      return task;
    }));

    setEditingTask(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditData({});
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB');
  };

  const getTasksByPhase = () => {
    const tasksByPhase: { [key: string]: Task[] } = {};
    phases.forEach(phase => {
      tasksByPhase[phase.value] = tasks.filter(task => task.phase === phase.value);
    });
    return tasksByPhase;
  };

  const getTimelineData = () => {
    if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 1 };

    const dates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return { startDate: minDate, endDate: maxDate, totalDays };
  };

  const getTaskPosition = (task: Task, timelineStart: Date, totalDays: number) => {
    const taskStart = Math.floor((task.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const left = (taskStart / totalDays) * 100;
    const width = (task.duration / totalDays) * 100;
    return { left, width };
  };

  const getProgressPercentage = (task: Task): number => {
    const today = new Date();
    if (today < task.startDate) return 0;
    if (today > task.endDate) return 100;
    
    const totalDuration = task.endDate.getTime() - task.startDate.getTime();
    const elapsed = today.getTime() - task.startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const tasksByPhase = getTasksByPhase();
  const { startDate: timelineStart, totalDays } = getTimelineData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Project Gantt Dashboard</h1>
          </div>
          <p className="text-gray-600">Plan, track, and manage your project tasks with interactive Gantt charts</p>
        </div>

        {/* Task Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter task name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Phase</label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {phases.map(phase => (
                  <option key={phase.value} value={phase.value}>{phase.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => date && setFormData({ ...formData, startDate: date })}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => date && setFormData({ ...formData, endDate: date })}
                dateFormat="dd/MM/yyyy"
                minDate={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Predecessor (Optional)</label>
              <input
                type="text"
                value={formData.predecessor}
                onChange={(e) => setFormData({ ...formData, predecessor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Task dependency"
              />
            </div>
          </div>

          <button
            onClick={addTask}
            disabled={!formData.name.trim()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Task Overview</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predecessor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {phases.map((phase, phaseIndex) => {
                  const phaseTasks = tasksByPhase[phase.value];
                  if (phaseTasks.length === 0) return null;

                  return phaseTasks.map((task, taskIndex) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      {taskIndex === 0 && (
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          rowSpan={phaseTasks.length}
                        >
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${phase.color}`}>
                            {phase.label}
                          </span>
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingTask === task.id ? (
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          task.name
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.duration} days
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingTask === task.id ? (
                          <DatePicker
                            selected={editData.startDate || task.startDate}
                            onChange={(date) => date && setEditData({ ...editData, startDate: date })}
                            dateFormat="dd/MM/yyyy"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          formatDate(task.startDate)
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingTask === task.id ? (
                          <DatePicker
                            selected={editData.endDate || task.endDate}
                            onChange={(date) => date && setEditData({ ...editData, endDate: date })}
                            dateFormat="dd/MM/yyyy"
                            minDate={editData.startDate || task.startDate}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          formatDate(task.endDate)
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingTask === task.id ? (
                          <input
                            type="text"
                            value={editData.predecessor || ''}
                            onChange={(e) => setEditData({ ...editData, predecessor: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          task.predecessor || '-'
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingTask === task.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(task)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gantt Timeline */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline View
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {tasks.map((task) => {
                  const { left, width } = getTaskPosition(task, timelineStart, totalDays);
                  const progressPercentage = getProgressPercentage(task);
                  const phaseColor = phaseColors[task.phase as keyof typeof phaseColors];
                  
                  return (
                    <div key={task.id} className="relative">
                      <div className="flex items-center mb-2">
                        <div className="w-48 text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          {formatDate(task.startDate)} - {formatDate(task.endDate)}
                        </div>
                      </div>
                      
                      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className={`absolute top-0 h-full ${phaseColor} rounded-lg transition-all duration-300 hover:opacity-80`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <div 
                            className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded-lg"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white text-shadow">
                          {task.duration}d
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Timeline: {formatDate(timelineStart)} - {formatDate(new Date(timelineStart.getTime() + (totalDays - 1) * 24 * 60 * 60 * 1000))}</span>
                  <span>Total Duration: {totalDays} days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500">Add your first task above to get started with your project timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}