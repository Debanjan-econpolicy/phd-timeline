import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, Trash2, ChevronDown, ChevronRight, Save, Play, Pause, RotateCcw, Printer, Flag, TrendingUp, Edit2, Check, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('gantt');
  const [lastSaved, setLastSaved] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  
  // Timeline window controls
  const [timelineStart, setTimelineStart] = useState({ month: 10, year: 2025 });
  const [timelineEnd, setTimelineEnd] = useState({ month: 12, year: 2026 });
  
  const getInitialTasks = () => {
    const saved = localStorage.getItem('phdTimelineTasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'MGP Paper', startMonth: 10, startYear: 2025, startWeek: 1, endMonth: 12, endYear: 2025, endWeek: 1, color: 'bg-blue-500', priority: 'high', expanded: false, subtasks: [
        { id: 101, name: 'Literature Review', completed: true },
        { id: 102, name: 'Data Analysis', completed: true },
        { id: 103, name: 'Writing Draft', completed: false }
      ]},
      { id: 2, name: 'NEFF Paper', startMonth: 12, startYear: 2025, startWeek: 2, endMonth: 2, endYear: 2026, endWeek: 2, color: 'bg-purple-500', priority: 'medium', expanded: false, subtasks: [
        { id: 201, name: 'Research Design', completed: false },
        { id: 202, name: 'Data Collection', completed: false }
      ]},
      { id: 3, name: 'Honesty Paper', startMonth: 11, startYear: 2025, startWeek: 3, endMonth: 3, endYear: 2026, endWeek: 4, color: 'bg-orange-500', priority: 'low', expanded: false, subtasks: [] }
    ];
  };

  const getInitialMilestones = () => {
    const saved = localStorage.getItem('phdMilestones');
    if (saved) return JSON.parse(saved);
    return [];
  };

  const getInitialDailyTasks = () => {
    const saved = localStorage.getItem('phdDailyTasks');
    if (saved) return JSON.parse(saved);
    return {};
  };

  const getInitialPomodoros = () => {
    const saved = localStorage.getItem('phdPomodoros');
    if (saved) return JSON.parse(saved);
    return {};
  };

  const [tasks, setTasks] = useState(getInitialTasks);
  const [milestones, setMilestones] = useState(getInitialMilestones);
  const [dailyTasks, setDailyTasks] = useState(getInitialDailyTasks);
  const [pomodoroSessions, setPomodoroSessions] = useState(getInitialPomodoros);
  
  const [newTask, setNewTask] = useState({ name: '', startMonth: 10, startYear: 2025, startWeek: 1, endMonth: 10, endYear: 2025, endWeek: 4, priority: 'medium' });
  const [newSubtask, setNewSubtask] = useState('');
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ name: '', month: 10, year: 2025, week: 1 });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [newDailyTask, setNewDailyTask] = useState('');
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('phdTimelineTasks', JSON.stringify(tasks));
    localStorage.setItem('phdMilestones', JSON.stringify(milestones));
    localStorage.setItem('phdDailyTasks', JSON.stringify(dailyTasks));
    localStorage.setItem('phdPomodoros', JSON.stringify(pomodoroSessions));
    setLastSaved(new Date().toLocaleTimeString());
  }, [tasks, milestones, dailyTasks, pomodoroSessions]);

  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setPomodoroActive(false);
            if (audioRef.current) audioRef.current.play();
            
            if (!isBreak && selectedSubtask) {
              const sessionKey = selectedDate;
              const newSession = {
                subtaskId: selectedSubtask.subtaskId,
                taskId: selectedSubtask.taskId,
                duration: workMinutes,
                timestamp: new Date().toISOString()
              };
              setPomodoroSessions(prev => ({
                ...prev,
                [sessionKey]: [...(prev[sessionKey] || []), newSession]
              }));
            }
            
            if (!isBreak) {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              if (newCount % 4 === 0) {
                setIsBreak(true);
                setPomodoroTime(longBreakMinutes * 60);
              } else {
                setIsBreak(true);
                setPomodoroTime(breakMinutes * 60);
              }
            } else {
              setIsBreak(false);
              setPomodoroTime(workMinutes * 60);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [pomodoroActive, isBreak, workMinutes, breakMinutes, longBreakMinutes, pomodoroCount, selectedSubtask, selectedDate]);

  const generateTimeline = () => {
    const timeline = [];
    const startYear = timelineStart.year;
    const endYear = timelineEnd.year;
    const startMonth = timelineStart.month;
    const endMonth = timelineEnd.month;
    
    for (let year = startYear; year <= endYear; year++) {
      const firstMonth = (year === startYear) ? startMonth : 1;
      const lastMonth = (year === endYear) ? endMonth : 12;
      
      for (let month = firstMonth; month <= lastMonth; month++) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weeks = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 5 : 4;
        timeline.push({
          month: `${monthNames[month - 1]} ${year}`,
          weeks: weeks,
          monthNum: month,
          year: year
        });
      }
    }
    return timeline;
  };

  const timeline = generateTimeline();

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
    const startPos = getWeekPosition(task.startMonth, task.startWeek, task.startYear);
    const endPos = getWeekPosition(task.endMonth, task.endWeek, task.endYear);
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

  const startEditTask = (task) => {
    setEditingTask({ ...task });
  };

  const saveEditTask = () => {
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const cancelEditTask = () => {
    setEditingTask(null);
  };

  const startEditMilestone = (milestone) => {
    setEditingMilestone({ ...milestone });
  };

  const saveEditMilestone = () => {
    setMilestones(milestones.map(m => m.id === editingMilestone.id ? editingMilestone : m));
    setEditingMilestone(null);
  };

  const cancelEditMilestone = () => {
    setEditingMilestone(null);
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
      setTasks([...tasks, { id: Date.now(), ...newTask, color: colors[Math.floor(Math.random() * colors.length)], expanded: false, subtasks: [] }]);
      setNewTask({ name: '', startMonth: 10, startYear: 2025, startWeek: 1, endMonth: 10, endYear: 2025, endWeek: 4, priority: 'medium' });
    }
  };

  const addSubtask = (taskId) => {
    if (newSubtask.trim()) {
      setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: [...task.subtasks, { id: Date.now(), name: newSubtask, completed: false }] } : task));
      setNewSubtask('');
      setAddingSubtaskTo(null);
    }
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) } : task));
  };

  const toggleExpand = (taskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, expanded: !task.expanded } : task));
  };

  const deleteTask = (id) => setTasks(tasks.filter(task => task.id !== id));
  
  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) } : task));
  };

  const addMilestone = () => {
    if (newMilestone.name.trim()) {
      setMilestones([...milestones, { id: Date.now(), ...newMilestone }]);
      setNewMilestone({ name: '', month: 10, year: 2025, week: 1 });
      setShowMilestoneForm(false);
    }
  };

  const deleteMilestone = (id) => setMilestones(milestones.filter(m => m.id !== id));

  const addDailyTask = () => {
    if (newDailyTask.trim()) {
      setDailyTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), { id: Date.now(), text: newDailyTask, completed: false }]
      }));
      setNewDailyTask('');
    }
  };

  const toggleDailyTask = (taskId) => {
    setDailyTasks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteDailyTask = (taskId) => {
    setDailyTasks(prev => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter(t => t.id !== taskId)
    }));
  };

  const getYesterdayDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const carryForwardTask = (task) => {
    setDailyTasks(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), { ...task, id: Date.now() }]
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    if (!isBreak && !selectedSubtask) {
      alert('Please select a subtask to work on');
      return;
    }
    setPomodoroActive(true);
  };

  const pausePomodoro = () => setPomodoroActive(false);
  
  const resetPomodoro = () => {
    setPomodoroActive(false);
    setPomodoroTime(isBreak ? (pomodoroCount % 4 === 0 ? longBreakMinutes * 60 : breakMinutes * 60) : workMinutes * 60);
  };

  const getWeekDates = () => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const getTotalPomodorosForSubtask = (taskId, subtaskId, period) => {
    let total = 0;
    const now = new Date();
    
    Object.entries(pomodoroSessions).forEach(([date, sessions]) => {
      const sessionDate = new Date(date);
      let include = period === 'all';
      
      if (period === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        include = sessionDate >= weekStart;
      } else if (period === 'month') {
        include = sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
      }
      
      if (include) {
        sessions.forEach(s => {
          if (s.taskId === taskId && s.subtaskId === subtaskId) {
            total += s.duration;
          }
        });
      }
    });
    
    return Math.round(total / 60 * 10) / 10;
  };

  const getAllSubtasksWithTime = () => {
    const subtaskTimes = [];
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        const weekHours = getTotalPomodorosForSubtask(task.id, subtask.id, 'week');
        const monthHours = getTotalPomodorosForSubtask(task.id, subtask.id, 'month');
        if (weekHours > 0 || monthHours > 0) {
          subtaskTimes.push({ 
            taskName: task.name, 
            subtaskName: subtask.name, 
            weekHours: weekHours, 
            monthHours: monthHours 
          });
        }
      });
    });
    return subtaskTimes;
  };

  let weekCounter = 0;
  const weekPositions = [];
  timeline.forEach(month => {
    for (let i = 0; i < month.weeks; i++) {
      weekPositions.push({ week: i + 1, month: month.month, pos: weekCounter });
      weekCounter++;
    }
  });

  const todaysTasks = dailyTasks[selectedDate] || [];
  const yesterdaysTasks = dailyTasks[getYesterdayDate()] || [];
  const pendingYesterday = yesterdaysTasks.filter(t => !t.completed);
  const weekDates = getWeekDates();

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => window.print(), 100);
    setTimeout(() => setIsPrinting(false), 500);
  };

  // Collect ALL subtasks from ALL tasks - this ensures subtasks always show
  const allSubtasks = [];
  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        allSubtasks.push({
          taskId: task.id,
          subtaskId: subtask.id,
          taskName: task.name,
          subtaskName: subtask.name,
          taskColor: task.color
        });
      });
    }
  });

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-50">
      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 10mm;
          }
          .no-print { display: none !important; }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100%;
            height: 100%;
            page-break-inside: avoid;
          }
          .gantt-table {
            font-size: 8pt;
          }
          .task-bar {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      
      <audio ref={audioRef}>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrj8zw3JBAChhfu+jnmkkTA0+l4e+zYBoFMYvR8c2EOgcdf8rx2YhFDBhfvefmqVEQC06g4OyjVhcEOZPU8cx8LQQmdMPu2o9BAQxatunjuVkSCUqf4PK8aB8EKoHM8tuJNwgZbLvs559NEAxQpu3uz2wbBDKK0fDMeywFJ2/A69qQQwoTYq/n5qpTEQpLn+Hyu2kgBSuPzPDckEAKGGC76OiZSRMDT6Th77NgGgUxi9LxyoU6Bx5/yvHZiUUMF2C84udqVRIJSp/i87xtJAUrd8Pt144+CwZZsujnsVsTBkqd3vO3ZhsFMYjO8ciDOQYffMjr1INECxRguObmrVUSCUub4fO9ayIFLYHI79aJOwcccLrr5KBSFQ1NoN7xsmEaBTCMz/HJhDsIH3zI69SCRAwXYrfm5qxUEwlJnuL0vG0jBS+Ax+/ZizoHHHG76+KfUxUNTqHe8bJhGQUvjM/xyYQ7CB58x+rUg0QMGGO45+erVBMISZ7i9LptIwUuf8fu2Ys9BxtyuOrioVQUDk2g3u+xYRsFLorN8ciDOgcef8jq1YRGDBZiuOXnq1UUCUme4/O5ayQFLoDH7tiKPAcbcrjq4qBTFAxOod7vsWEcBTCKzvDHhDsHH37H6tWERgwVY7bm56xWFAlKnuP0uWwkBS+Bx+7YizoHG3K46+KgUhQMTZ/e77FhGwUwis7wx4Q7Bx99x+vVhEYMFWO35+etVxQJS57j9LpuJQUugcfu14s8BxtyuOvhoFIUDE2f3u+xYRsFMIrO8MeEOwcffMfq1IRFDBVktubmrFYTCkue5PS6bSQFLoHH7taLPAYbcrrq4Z9RFAZNo97vsV8aBTCKzfLHgzsGH3vH6tWERQwVZLfm5qtWFApLnuP0umwjBS2Cx+7WijwHG3K66+KfUhQMTJ/e77BfGgQwiM7wx4M7Bx98x+vVhEUMFGS35uarVRMJS57k9LpsIwUtgsfv1oo8BxpyuuvhoFIVDEyf3vCwXxoFMIjO8MeDOwcffMfr1IRFDBRjt+bmqVUSCUud4/S6bCIFLYLH79eKPQcbcrjq4p9SFQxNn97vsWEaBTCIzvDHgzoHH33I6tWERQwUZLbl56tVEwlLneP0um4kBS6Bxu/YizwGG3K66+GfUhMMTZ/e8bFhGgUxic7xyIM7Bx99yOrVhEUMFWS25uarVhIJS53j9LpsIgUtgcfv14o8BxtsuuvhoFMVDE2f3u+wYBoEMInO8MiEOwcefcfq1YRFDBVjtuXmq1YTCkud4/S6bSIFLYLI79eKPQcbcrjq4p9SFAxMn97vsWAaBDCKzvDIgzoHHnzH6tWERQwVY7fl5qtVFApLnuT0um0jBS2Bx+/Xij0HGnK46+KfURQMTZ/e77FgGgQwis7wyYM6Bx58x+rVhEUMFWO25earVRMJS57j9LpuIwUtgsfv14o9Bhty" type="audio/wav" />
      </audio>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print-container">
        <div className="flex items-center justify-between mb-6 no-print">
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
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-300 no-print">
          <button onClick={() => setActiveTab('gantt')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'gantt' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            Gantt Chart
          </button>
          <button onClick={() => setActiveTab('week')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'week' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            Week View
          </button>
          <button onClick={() => setActiveTab('daily')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'daily' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            Daily + Pomodoro
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}>
            Analytics
          </button>
        </div>

        {activeTab === 'gantt' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 no-print">
              <h3 className="font-semibold mb-3 text-blue-900">Timeline Window Settings</h3>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm mb-1">Start Date:</label>
                  <input 
                    type="month" 
                    value={`${timelineStart.year}-${String(timelineStart.month).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setTimelineStart({ month: parseInt(month), year: parseInt(year) });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Date:</label>
                  <input 
                    type="month" 
                    value={`${timelineEnd.year}-${String(timelineEnd.month).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setTimelineEnd({ month: parseInt(month), year: parseInt(year) });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{timeline.length}</span> months displayed
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 no-print">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New Task</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    placeholder="Task name" 
                    value={newTask.name} 
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <input 
                    type="month" 
                    value={`${newTask.startYear}-${String(newTask.startMonth).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setNewTask({ ...newTask, startMonth: parseInt(month), startYear: parseInt(year) });
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <select 
                    value={newTask.startWeek} 
                    onChange={(e) => setNewTask({ ...newTask, startWeek: parseInt(e.target.value) })} 
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input 
                    type="month" 
                    value={`${newTask.endYear}-${String(newTask.endMonth).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setNewTask({ ...newTask, endMonth: parseInt(month), endYear: parseInt(year) });
                    }}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <select 
                    value={newTask.endWeek} 
                    onChange={(e) => setNewTask({ ...newTask, endWeek: parseInt(e.target.value) })} 
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {[1, 2, 3, 4, 5].map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                onClick={addTask} 
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="mb-4 no-print">
              <button 
                onClick={() => setShowMilestoneForm(!showMilestoneForm)} 
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Flag className="w-4 h-4" />
                {showMilestoneForm ? 'Hide' : 'Add'} Milestone
              </button>
              {showMilestoneForm && (
                <div className="mt-3 bg-purple-50 p-4 rounded-lg">
                  <div className="flex gap-3 mb-3">
                    <input 
                      type="text" 
                      placeholder="Milestone name" 
                      value={newMilestone.name} 
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md" 
                    />
                    <input 
                      type="month" 
                      value={`${newMilestone.year}-${String(newMilestone.month).padStart(2, '0')}`}
                      onChange={(e) => {
                        const [year, month] = e.target.value.split('-');
                        setNewMilestone({ ...newMilestone, month: parseInt(month), year: parseInt(year) });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select 
                      value={newMilestone.week} 
                      onChange={(e) => setNewMilestone({ ...newMilestone, week: parseInt(e.target.value) })} 
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {[1, 2, 3, 4, 5].map(w => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                    <button 
                      onClick={addMilestone} 
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {milestones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Existing Milestones:</h4>
                      {milestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          {editingMilestone?.id === m.id ? (
                            <>
                              <input 
                                type="text" 
                                value={editingMilestone.name} 
                                onChange={(e) => setEditingMilestone({ ...editingMilestone, name: e.target.value })}
                                className="flex-1 px-2 py-1 border rounded mr-2"
                              />
                              <input 
                                type="month" 
                                value={`${editingMilestone.year}-${String(editingMilestone.month).padStart(2, '0')}`}
                                onChange={(e) => {
                                  const [year, month] = e.target.value.split('-');
                                  setEditingMilestone({ ...editingMilestone, month: parseInt(month), year: parseInt(year) });
                                }}
                                className="px-2 py-1 border rounded mr-2"
                              />
                              <select 
                                value={editingMilestone.week}
                                onChange={(e) => setEditingMilestone({ ...editingMilestone, week: parseInt(e.target.value) })}
                                className="px-2 py-1 border rounded mr-2"
                              >
                                {[1, 2, 3, 4, 5].map(w => (
                                  <option key={w} value={w}>W{w}</option>
                                ))}
                              </select>
                              <button onClick={saveEditMilestone} className="text-green-600 hover:text-green-800 mr-1">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEditMilestone} className="text-gray-600 hover:text-gray-800">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1">{m.name} - {timeline.find(t => t.monthNum === m.month && t.year === m.year)?.month || `${m.month}/${m.year}`} W{m.week}</span>
                              <button onClick={() => startEditMilestone(m)} className="text-blue-600 hover:text-blue-800 mr-2">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteMilestone(m.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto border rounded-lg gantt-table">
              <div className="inline-block min-w-full">
                <div className="sticky top-0 bg-white z-10">
                  <div className="flex border-b border-gray-300">
                    <div className="w-64 flex-shrink-0 p-3 font-bold text-gray-800 bg-gray-100 border-r border-gray-300">
                      Task / Progress
                    </div>
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
                    <div className="w-64 flex-shrink-0 p-2 text-xs text-gray-600 bg-gray-50 border-r border-gray-300">
                      Subtasks
                    </div>
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

                {tasks.map((task) => {
                  const span = getTaskSpan(task);
                  const progress = calculateProgress(task);
                  const isEditing = editingTask?.id === task.id;
                  
                  return (
                    <div key={task.id}>
                      <div className="flex border-b border-gray-200 hover:bg-blue-50 group">
                        <div className="w-64 flex-shrink-0 bg-white sticky left-0 border-r border-gray-300">
                          <div className="p-3">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input 
                                  type="text" 
                                  value={editingTask.name}
                                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                />
                                <div className="flex gap-2">
                                  <input 
                                    type="month" 
                                    value={`${editingTask.startYear}-${String(editingTask.startMonth).padStart(2, '0')}`}
                                    onChange={(e) => {
                                      const [year, month] = e.target.value.split('-');
                                      setEditingTask({ ...editingTask, startMonth: parseInt(month), startYear: parseInt(year) });
                                    }}
                                    className="flex-1 px-1 py-1 border rounded text-xs"
                                  />
                                  <select 
                                    value={editingTask.startWeek}
                                    onChange={(e) => setEditingTask({ ...editingTask, startWeek: parseInt(e.target.value) })}
                                    className="px-1 py-1 border rounded text-xs"
                                  >
                                    {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>W{w}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    type="month" 
                                    value={`${editingTask.endYear}-${String(editingTask.endMonth).padStart(2, '0')}`}
                                    onChange={(e) => {
                                      const [year, month] = e.target.value.split('-');
                                      setEditingTask({ ...editingTask, endMonth: parseInt(month), endYear: parseInt(year) });
                                    }}
                                    className="flex-1 px-1 py-1 border rounded text-xs"
                                  />
                                  <select 
                                    value={editingTask.endWeek}
                                    onChange={(e) => setEditingTask({ ...editingTask, endWeek: parseInt(e.target.value) })}
                                    className="px-1 py-1 border rounded text-xs"
                                  >
                                    {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>W{w}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={saveEditTask} className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs">
                                    <Check className="w-3 h-3 inline" />
                                  </button>
                                  <button onClick={cancelEditTask} className="flex-1 px-2 py-1 bg-gray-400 text-white rounded text-xs">
                                    <X className="w-3 h-3 inline" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  {task.subtasks.length > 0 && (
                                    <button 
                                      onClick={() => toggleExpand(task.id)} 
                                      className="text-gray-600 no-print"
                                    >
                                      {task.expanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-800">{task.name}</div>
                                    {task.subtasks.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${getProgressColor(progress)}`} 
                                            style={{ width: `${progress}%` }} 
                                          />
                                        </div>
                                        <span className="text-xs text-gray-600">{progress}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 no-print">
                                  <button onClick={() => startEditTask(task)} className="text-blue-500 hover:text-blue-700">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex relative">
                          {weekPositions.map((wp, idx) => {
                            const milestone = milestones.find(m => {
                              const mPos = getWeekPosition(m.month, m.week, m.year);
                              return mPos === idx;
                            });
                            
                            return (
                              <div 
                                key={idx} 
                                className="w-10 flex-shrink-0 border-l border-gray-100 relative h-16"
                              >
                                {idx >= span.start && idx < span.start + span.duration && (
                                  <div className={`absolute inset-1 ${task.color} rounded shadow-sm task-bar`}>
                                    {idx === span.start && span.duration > 2 && (
                                      <div className="text-white text-xs px-1 py-1 font-semibold truncate">
                                        {span.duration}w
                                      </div>
                                    )}
                                  </div>
                                )}
                                {milestone && (
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 group/milestone z-20">
                                    <Flag className="w-4 h-4 text-purple-600 fill-purple-200" />
                                    <div className="hidden group-hover/milestone:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                                      {milestone.name}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {task.expanded && (
                        <>
                          {task.subtasks.map(subtask => (
                            <div 
                              key={subtask.id} 
                              className="flex border-b border-gray-100 bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="w-64 flex-shrink-0 p-3 pl-16 flex items-center justify-between border-r border-gray-300">
                                <div className="flex items-center gap-2 flex-1">
                                  <input 
                                    type="checkbox" 
                                    checked={subtask.completed} 
                                    onChange={() => toggleSubtask(task.id, subtask.id)} 
                                    className="w-4 h-4 text-blue-600 rounded no-print" 
                                  />
                                  <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                    {subtask.name}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => deleteSubtask(task.id, subtask.id)} 
                                  className="text-red-400 hover:text-red-600 no-print"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex">
                                {weekPositions.map((wp, idx) => (
                                  <div 
                                    key={idx} 
                                    className="w-10 flex-shrink-0 border-l border-gray-200 h-10"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          {addingSubtaskTo === task.id ? (
                            <div className="flex border-b border-gray-200 bg-blue-50 no-print">
                              <div className="w-64 flex-shrink-0 p-3 pl-16 flex items-center gap-2 border-r border-gray-300">
                                <input 
                                  type="text" 
                                  value={newSubtask} 
                                  onChange={(e) => setNewSubtask(e.target.value)} 
                                  onKeyPress={(e) => e.key === 'Enter' && addSubtask(task.id)} 
                                  placeholder="Subtask name" 
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded" 
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
                            <div className="flex border-b border-gray-200 bg-gray-50 hover:bg-gray-100 no-print">
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

        {activeTab === 'week' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Week View</h2>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, idx) => {
                const dayTasks = dailyTasks[date] || [];
                const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx];
                const isToday = date === new Date().toISOString().split('T')[0];
                
                return (
                  <div 
                    key={date} 
                    className={`border rounded-lg p-3 ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="font-semibold text-sm mb-2">{dayName}</div>
                    <div className="text-xs text-gray-600 mb-3">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="space-y-2">
                      {dayTasks.map(t => (
                        <div 
                          key={t.id} 
                          className={`text-xs p-2 rounded ${t.completed ? 'bg-green-50 line-through text-gray-500' : 'bg-blue-50'}`}
                        >
                          {t.text}
                        </div>
                      ))}
                      {dayTasks.length === 0 && (
                        <div className="text-xs text-gray-400">No tasks</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Select Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                />
              </div>

              {pendingYesterday.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Pending from Yesterday</h3>
                  {pendingYesterday.map(t => (
                    <div key={t.id} className="flex items-center justify-between mb-2">
                      <span className="text-sm">{t.text}</span>
                      <button 
                        onClick={() => carryForwardTask(t)} 
                        className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                      >
                        Carry Forward
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Daily Tasks</h3>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={newDailyTask} 
                    onChange={(e) => setNewDailyTask(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && addDailyTask()} 
                    placeholder="Add daily task..." 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md" 
                  />
                  <button 
                    onClick={addDailyTask} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {todaysTasks.map(t => (
                    <div 
                      key={t.id} 
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input 
                          type="checkbox" 
                          checked={t.completed} 
                          onChange={() => toggleDailyTask(t.id)} 
                          className="w-4 h-4" 
                        />
                        <span className={`text-sm ${t.completed ? 'line-through text-gray-500' : ''}`}>
                          {t.text}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteDailyTask(t.id)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                <h3 className="font-bold text-lg mb-4">Pomodoro Timer</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs mb-1">Work (min)</label>
                    <input 
                      type="number" 
                      value={workMinutes} 
                      onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 25))} 
                      className="w-full px-2 py-1 border rounded text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Break (min)</label>
                    <input 
                      type="number" 
                      value={breakMinutes} 
                      onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 5))} 
                      className="w-full px-2 py-1 border rounded text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Long Break</label>
                    <input 
                      type="number" 
                      value={longBreakMinutes} 
                      onChange={(e) => setLongBreakMinutes(Math.max(1, parseInt(e.target.value) || 15))} 
                      className="w-full px-2 py-1 border rounded text-sm" 
                    />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-6xl font-bold ${isBreak ? 'text-green-600' : 'text-red-600'}`}>
                    {formatTime(pomodoroTime)}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {isBreak ? (pomodoroCount % 4 === 0 ? 'Long Break' : 'Break Time') : 'Work Time'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Pomodoros completed: {pomodoroCount}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Select Subtask to Work On</label>
                  <select 
                    value={selectedSubtask ? `${selectedSubtask.taskId}-${selectedSubtask.subtaskId}` : ''} 
                    onChange={(e) => {
                      if (e.target.value) {
                        const [taskId, subtaskId] = e.target.value.split('-').map(Number);
                        const item = allSubtasks.find(s => s.taskId === taskId && s.subtaskId === subtaskId);
                        if (item) {
                          setSelectedSubtask({ 
                            taskId: item.taskId, 
                            subtaskId: item.subtaskId, 
                            taskName: item.taskName, 
                            subtaskName: item.subtaskName 
                          });
                        }
                      } else {
                        setSelectedSubtask(null);
                      }
                    }} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
                    disabled={isBreak}
                  >
                    <option value="">-- Select a subtask --</option>
                    {allSubtasks.map(item => (
                      <option 
                        key={`${item.taskId}-${item.subtaskId}`} 
                        value={`${item.taskId}-${item.subtaskId}`}
                      >
                        {item.taskName} → {item.subtaskName}
                      </option>
                    ))}
                  </select>
                  {selectedSubtask && !isBreak && (
                    <div className="mt-2 text-xs text-gray-600">
                      Working on: <span className="font-semibold">
                        {selectedSubtask.taskName} → {selectedSubtask.subtaskName}
                      </span>
                    </div>
                  )}
                  {allSubtasks.length === 0 && (
                    <p className="text-xs text-red-500 mt-2 font-semibold">
                      No subtasks available. Go to Gantt Chart tab, expand a task (click arrow), and click "Add Subtask"
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!pomodoroActive ? (
                    <button 
                      onClick={startPomodoro} 
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start
                    </button>
                  ) : (
                    <button 
                      onClick={pausePomodoro} 
                      className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center justify-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </button>
                  )}
                  <button 
                    onClick={resetPomodoro} 
                    className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Time Tracking Analytics
            </h2>

            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h3 className="font-semibold">Hours Spent Per Subtask</h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Task</th>
                      <th className="text-left py-2">Subtask</th>
                      <th className="text-right py-2">This Week (hrs)</th>
                      <th className="text-right py-2">This Month (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllSubtasksWithTime().map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3">{item.taskName}</td>
                        <td className="py-3">{item.subtaskName}</td>
                        <td className="text-right py-3 font-semibold">{item.weekHours}</td>
                        <td className="text-right py-3 font-semibold">{item.monthHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getAllSubtasksWithTime().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pomodoro sessions recorded yet. Start tracking your work in the Daily tab!
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-sm text-blue-600 font-medium">Total Pomodoros</div>
                <div className="text-4xl font-bold text-blue-900 mt-2">{pomodoroCount}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-sm text-green-600 font-medium">Hours This Week</div>
                <div className="text-4xl font-bold text-green-900 mt-2">
                  {getAllSubtasksWithTime().reduce((sum, item) => sum + item.weekHours, 0).toFixed(1)}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-sm text-purple-600 font-medium">Hours This Month</div>
                <div className="text-4xl font-bold text-purple-900 mt-2">
                  {getAllSubtasksWithTime().reduce((sum, item) => sum + item.monthHours, 0).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}