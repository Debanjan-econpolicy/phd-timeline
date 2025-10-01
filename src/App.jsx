import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock, Save } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('gantt');
  const [lastSaved, setLastSaved] = useState(null);
  
  const getInitialTasks = () => {
    const saved = localStorage.getItem('phdTimelineTasks');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { 
        id: 1, 
        name: 'MGP Paper', 
        startMonth: 10, 
        startWeek: 1, 
        endMonth: 12, 
        endWeek: 1, 
        color: 'bg-blue-500',
        priority: 'high',
        expanded: false,
        subtasks: [
          { id: 101, name: 'Literature Review', completed: true },
          { id: 102, name: 'Data Analysis', completed: true },
          { id: 103, name: 'Writing Draft', completed: false },
          { id: 104, name: 'Revisions', completed: false }
        ]
      },
      { 
        id: 2, 
        name: 'NEFF Paper', 
        startMonth: 12, 
        startWeek: 2, 
        endMonth: 2, 
        endWeek: 2, 
        color: 'bg-purple-500',
        priority: 'medium',
        expanded: false,
        subtasks: [
          { id: 201, name: 'Research Design', completed: true },
          { id: 202, name: 'Data Collection', completed: false },
          { id: 203, name: 'Analysis', completed: false }
        ]
      },
      { 
        id: 3, 
        name: 'Honesty Paper', 
        startMonth: 11, 
        startWeek: 3, 
        endMonth: 3, 
        endWeek: 4, 
        color: 'bg-orange-500',
        priority: 'low',
        expanded: false,
        subtasks: []
      },
    ];
  };
  
  const [tasks, setTasks] = useState(getInitialTasks);
  
  useEffect(() => {
    localStorage.setItem('phdTimelineTasks', JSON.stringify(tasks));
    setLastSaved(new Date().toLocaleTimeString());
  }, [tasks]);

  const [newTask, setNewTask] = useState({ 
    name: '', 
    startMonth: 10, 
    startWeek: 1, 
    endMonth: 10, 
    endWeek: 4,
    priority: 'medium'
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);

  const timeline = [
    { month: 'Oct 2024', weeks: 4, monthNum: 10, year: 2024 },
    { month: 'Nov 2024', weeks: 4, monthNum: 11, year: 2024 },
    { month: 'Dec 2024', weeks: 5, monthNum: 12, year: 2024 },
    { month: 'Jan 2025', weeks: 4, monthNum: 1, year: 2025 },
    { month: 'Feb 2025', weeks: 4, monthNum: 2, year: 2025 },
    { month: 'Mar 2025', weeks: 4, monthNum: 3, year: 2025 },
    { month: 'Apr 2025', weeks: 4, monthNum: 4, year: 2025 },
    { month: 'May 2025', weeks: 5, monthNum: 5, year: 2025 },
    { month: 'Jun 2025', weeks: 4, monthNum: 6, year: 2025 },
    { month: 'Jul 2025', weeks: 4, monthNum: 7, year: 2025 },
    { month: 'Aug 2025', weeks: 4, monthNum: 8, year: 2025 },
    { month: 'Sep 2025', weeks: 5, monthNum: 9, year: 2025 },
    { month: 'Oct 2025', weeks: 4, monthNum: 10, year: 2025 },
    { month: 'Nov 2025', weeks: 4, monthNum: 11, year: 2025 },
    { month: 'Dec 2025', weeks: 4, monthNum: 12, year: 2025 },
  ];

  const getWeekPosition = (monthNum, weekNum, year) => {
    let position = 0;
    for (let i = 0; i < timeline.length; i++) {
      const t = timeline[i];
      if (t.monthNum === monthNum && t.year === year) {
        return position + weekNum - 1;
      }
      position += t.weeks;
    }
    return position;
  };

  const getTaskSpan = (task) => {
    const startYear = task.startMonth >= 10 ? 2024 : 2025;
    const endYear = (task.endMonth < 10 || (task.endMonth === 10 && startYear === 2025)) ? 2025 : 2024;
    const startPos = getWeekPosition(task.startMonth, task.startWeek, startYear);
    const endPos = getWeekPosition(task.endMonth, task.endWeek, endYear);
    return { start: startPos, duration: endPos - startPos + 1 };
  };

  const calculateProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
      setTasks([...tasks, {
        id: Date.now(),
        ...newTask,
        color: colors[Math.floor(Math.random() * colors.length)],
        expanded: false,
        subtasks: []
      }]);
      setNewTask({ name: '', startMonth: 10, startWeek: 1, endMonth: 10, endWeek: 4, priority: 'medium' });
    }
  };

  const addSubtask = (taskId) => {
    if (newSubtask.trim()) {
      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: [...task.subtasks, { id: Date.now(), name: newSubtask, completed: false }]
          };
        }
        return task;
      }));
      setNewSubtask('');
      setAddingSubtaskTo(null);
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return task;
    }));
  };

  const toggleExpand = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, expanded: !task.expanded } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return task;
    }));
  };

  const moveTaskUp = (index) => {
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index - 1]] = [newTasks[index - 1], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const moveTaskDown = (index) => {
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const getCurrentWeekTasks = () => {
    const today = new Date();
    return tasks.map(task => {
      const endYear = (task.endMonth < 10 || (task.endMonth === 10 && task.startMonth < 10)) ? 2025 : 2024;
      const taskEndDate = new Date(endYear, task.endMonth - 1, task.endWeek * 7);
      const daysUntilDue = Math.ceil((taskEndDate - today) / (1000 * 60 * 60 * 24));
      const progress = calculateProgress(task);
      
      let status = 'not-started';
      if (progress === 100) status = 'complete';
      else if (progress > 0) status = 'in-progress';

      let warning = null;
      if (status !== 'complete') {
        if (daysUntilDue < 0) warning = 'overdue';
        else if (daysUntilDue <= 7) warning = 'due-soon';
      }

      return { ...task, progress, status, daysUntilDue, warning };
    });
  };

  let weekCounter = 0;
  const weekPositions = [];
  timeline.forEach(month => {
    for (let i = 0; i < month.weeks; i++) {
      weekPositions.push({ week: i + 1, month: month.month, pos: weekCounter });
      weekCounter++;
    }
  });

  const weeklyTasks = getCurrentWeekTasks();
  const completedCount = weeklyTasks.filter(t => t.status === 'complete').length;
  const pendingCount = weeklyTasks.filter(t => t.status !== 'complete').length;
  const overdueCount = weeklyTasks.filter(t => t.warning === 'overdue').length;

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">PhD Thesis Timeline</h1>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Save className="w-4 h-4" />
                <span>Saved at {lastSaved}</span>
              </div>
            )}
            <span className="text-sm text-gray-600">October 2024 - December 2025</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-900">
              <strong>Auto-Save Enabled!</strong> Your data is automatically saved to your browser. 
              You can close this page and come back anytime - your timeline will be here!
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('gantt')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'gantt' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Gantt Chart
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'weekly' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 Weekly Dashboard
          </button>
        </div>

        {activeTab === 'gantt' && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New Task</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Task name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTask.startMonth}
                    onChange={(e) => setNewTask({ ...newTask, startMonth: parseInt(e.target.value) })}
                    className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeline.map((t, i) => (
                      <option key={i} value={t.monthNum}>{t.month}</option>
                    ))}
                  </select>
                  <select
                    value={newTask.startWeek}
                    onChange={(e) => setNewTask({ ...newTask, startWeek: parseInt(e.target.value) })}
                    className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>W{w}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTask.endMonth}
                    onChange={(e) => setNewTask({ ...newTask, endMonth: parseInt(e.target.value) })}
                    className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeline.map((t, i) => (
                      <option key={i} value={t.monthNum}>{t.month}</option>
                    ))}
                  </select>
                  <select
                    value={newTask.endWeek}
                    onChange={(e) => setNewTask({ ...newTask, endWeek: parseInt(e.target.value) })}
                    className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>W{w}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button
                    onClick={addTask}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <div className="inline-block min-w-full">
                <div className="sticky top-0 bg-white z-10">
                  <div className="flex border-b border-gray-300">
                    <div className="w-64 flex-shrink-0 p-3 font-bold text-gray-800 bg-gray-100 border-r border-gray-300">Task / Progress</div>
                    <div className="flex">
                      {timeline.map((month, idx) => (
                        <div 
                          key={idx} 
                          className="flex-shrink-0 px-2 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 border-l border-gray-300"
                          style={{ width: `${month.weeks * 40}px` }}
                        >
                          {month.month}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex border-b-2 border-gray-400">
                    <div className="w-64 flex-shrink-0 p-2 text-xs text-gray-600 bg-gray-50 border-r border-gray-300">Subtasks</div>
                    <div className="flex">
                      {weekPositions.map((wp, idx) => (
                        <div 
                          key={idx} 
                          className="w-10 flex-shrink-0 p-2 text-center text-xs text-gray-600 bg-gray-50 border-l border-gray-200"
                        >
                          W{wp.week}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {tasks.map((task, index) => {
                  const span = getTaskSpan(task);
                  const progress = calculateProgress(task);
                  const progressColor = getProgressColor(progress);
                  
                  return (
                    <div key={task.id}>
                      <div className="flex border-b border-gray-200 hover:bg-blue-50 group">
                        <div className="w-64 flex-shrink-0 bg-white sticky left-0 border-r border-gray-300">
                          <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex flex-col gap-1">
                                <button 
                                  onClick={() => moveTaskUp(index)}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                                >
                                  ▲
                                </button>
                                <button 
                                  onClick={() => moveTaskDown(index)}
                                  disabled={index === tasks.length - 1}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                                >
                                  ▼
                                </button>
                              </div>
                              {task.subtasks.length > 0 && (
                                <button onClick={() => toggleExpand(task.id)} className="text-gray-600">
                                  {task.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-800">{task.name}</div>
                                {task.subtasks.length > 0 && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${progressColor}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">{progress}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex relative">
                          {weekPositions.map((wp, idx) => (
                            <div key={idx} className="w-10 flex-shrink-0 border-l border-gray-100 relative h-16">
                              {idx >= span.start && idx < span.start + span.duration && (
                                <div className={`absolute inset-1 ${task.color} rounded shadow-sm`}>
                                  {idx === span.start && span.duration > 2 && (
                                    <div className="text-white text-xs px-1 py-1 font-semibold truncate">
                                      {span.duration}w
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {task.expanded && (
                        <>
                          {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
                              <div className="w-64 flex-shrink-0 p-3 pl-16 flex items-center justify-between border-r border-gray-300">
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => toggleSubtask(task.id, subtask.id)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                    {subtask.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => deleteSubtask(task.id, subtask.id)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex">
                                {weekPositions.map((wp, idx) => (
                                  <div key={idx} className="w-10 flex-shrink-0 border-l border-gray-200 h-10"></div>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          {addingSubtaskTo === task.id ? (
                            <div className="flex border-b border-gray-200 bg-blue-50">
                              <div className="w-64 flex-shrink-0 p-3 pl-16 flex items-center gap-2 border-r border-gray-300">
                                <input
                                  type="text"
                                  value={newSubtask}
                                  onChange={(e) => setNewSubtask(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addSubtask(task.id)}
                                  placeholder="Subtask name"
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => addSubtask(task.id)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setAddingSubtaskTo(null)}
                                  className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
                              <div className="w-64 flex-shrink-0 p-2 pl-16 border-r border-gray-300">
                                <button
                                  onClick={() => setAddingSubtaskTo(task.id)}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Subtask
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Tasks</div>
                <div className="text-3xl font-bold text-blue-900 mt-1">{tasks.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Completed</div>
                <div className="text-3xl font-bold text-green-900 mt-1">{completedCount}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium">In Progress</div>
                <div className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">Overdue</div>
                <div className="text-3xl font-bold text-red-900 mt-1">{overdueCount}</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">All Tasks Overview</h2>
              </div>
              
              <div className="divide-y">
                {weeklyTasks.map(task => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{task.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          
                          {task.warning === 'overdue' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              <AlertCircle className="w-3 h-3" />
                              OVERDUE
                            </span>
                          )}
                          {task.warning === 'due-soon' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Due in {task.daysUntilDue} days
                            </span>
                          )}
                          {task.status === 'complete' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              COMPLETE
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Due: {timeline.find(t => t.monthNum === task.endMonth)?.month} Week {task.endWeek}</span>
                          <span>Status: {task.status === 'complete' ? 'Complete' : task.status === 'in-progress' ? 'In Progress' : 'Not Started'}</span>
                        </div>
                        
                        {task.subtasks.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full ${getProgressColor(task.progress)}`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{task.progress}%</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.subtasks.filter(st => st.completed).length} of {task.subtasks.length} subtasks completed
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}