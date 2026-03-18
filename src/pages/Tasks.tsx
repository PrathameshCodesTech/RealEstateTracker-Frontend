import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { tasks as demoTasks, statusLabels, statusColors, priorityColors, getUserById, getProjectById, getTowerById, type Task, type TaskStatus } from "@/data/demo-data";
import { Search, CheckCircle2, MessageSquare, Plus, GripVertical } from "lucide-react";
import { NewTaskDialog } from "@/components/dialogs/NewTaskDialog";
import { useToast } from "@/hooks/use-toast";

const statusOrder: TaskStatus[] = ['not_started', 'ready', 'in_progress', 'blocked', 'review', 'completed', 'delayed'];

function TaskDetailDialog({ task, onUpdateTask }: { task: Task; onUpdateTask: (task: Task) => void }) {
  const hod = getUserById(task.assignedHOD);
  const project = getProjectById(task.projectId);
  const tower = getTowerById(task.towerId);
  const [newComment, setNewComment] = useState("");
  const [subtaskName, setSubtaskName] = useState("");
  const [localTask, setLocalTask] = useState(task);

  const addComment = () => {
    if (!newComment.trim()) return;
    const updated = { ...localTask, comments: [...localTask.comments, { user: 'Current User', text: newComment, date: new Date().toISOString().split('T')[0] }] };
    setLocalTask(updated);
    onUpdateTask(updated);
    setNewComment("");
  };

  const toggleChecklist = (itemId: string) => {
    const updated = {
      ...localTask,
      checklist: localTask.checklist.map(c => c.id === itemId ? { ...c, completed: !c.completed } : c),
    };
    const completedCount = updated.checklist.filter(c => c.completed).length;
    updated.progress = updated.checklist.length > 0 ? Math.round((completedCount / updated.checklist.length) * 100) : updated.progress;
    setLocalTask(updated);
    onUpdateTask(updated);
  };

  const changeStatus = (newStatus: TaskStatus) => {
    const updated = { ...localTask, status: newStatus };
    setLocalTask(updated);
    onUpdateTask(updated);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={priorityColors[localTask.priority]}>{localTask.priority}</Badge>
          <Select value={localTask.status} onValueChange={v => changeStatus(v as TaskStatus)}>
            <SelectTrigger className="w-auto h-6 text-xs border-0 bg-transparent p-0">
              <Badge className={statusColors[localTask.status]}>{statusLabels[localTask.status]}</Badge>
            </SelectTrigger>
            <SelectContent>
              {statusOrder.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogTitle className="font-display text-xl mt-2">{localTask.title}</DialogTitle>
        <p className="text-sm text-muted-foreground">{localTask.description}</p>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          <div className="text-sm"><span className="text-muted-foreground">Project:</span> <span className="font-medium">{project?.name}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">Tower:</span> <span className="font-medium">{tower?.name}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">Department:</span> <span className="font-medium">{localTask.department}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">Phase:</span> <span className="font-medium">{localTask.phase}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">HOD:</span> <span className="font-medium">{hod?.name}</span></div>
        </div>
        <div className="space-y-3">
          <div className="text-sm"><span className="text-muted-foreground">Planned:</span> <span className="font-medium">{localTask.startDate} — {localTask.endDate}</span></div>
          {localTask.actualStartDate && <div className="text-sm"><span className="text-muted-foreground">Actual Start:</span> <span className="font-medium">{localTask.actualStartDate}</span></div>}
          {localTask.delayDays > 0 && <div className="text-sm"><span className="text-muted-foreground">Delay:</span> <span className="font-medium text-destructive">{localTask.delayDays} days — {localTask.delayReason}</span></div>}
          {localTask.criticalPath && <Badge variant="destructive">Critical Path</Badge>}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-bold">{localTask.progress}%</span>
        </div>
        <Progress value={localTask.progress} className="h-3" />
      </div>

      {localTask.checklist.length > 0 && (
        <div className="mt-4">
          <h4 className="font-display font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Checklist ({localTask.checklist.filter(c => c.completed).length}/{localTask.checklist.length})
          </h4>
          <div className="space-y-2">
            {localTask.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleChecklist(item.id)}>
                <Checkbox checked={item.completed} />
                <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mt-4">
        <h4 className="font-display font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments ({localTask.comments.length})
        </h4>
        <div className="space-y-2 mb-3">
          {localTask.comments.map((comment, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{comment.user}</span>
                <span className="text-xs text-muted-foreground">{comment.date}</span>
              </div>
              <p className="text-muted-foreground">{comment.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && addComment()} />
          <Button size="sm" onClick={addComment}>Post</Button>
        </div>
      </div>
    </DialogContent>
  );
}

function TaskRow({ task, onUpdateTask }: { task: Task; onUpdateTask: (task: Task) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : task.status === 'delayed' || task.status === 'blocked' ? 'bg-destructive' : 'bg-muted-foreground/30'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{task.title}</p>
              {task.criticalPath && <Badge variant="destructive" className="text-[9px] px-1 py-0">CP</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{task.department}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{task.phase}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge className={`${priorityColors[task.priority]} text-[10px]`}>{task.priority}</Badge>
            <Badge className={`${statusColors[task.status]} text-[10px]`}>{statusLabels[task.status]}</Badge>
          </div>
          <Progress value={task.progress} className="h-1.5 w-16 hidden lg:flex" />
          <span className="text-xs font-medium w-8 text-right">{task.progress}%</span>
        </div>
      </DialogTrigger>
      <TaskDetailDialog task={task} onUpdateTask={onUpdateTask} />
    </Dialog>
  );
}

function KanbanColumn({ status, columnTasks, onUpdateTask, onDrop }: { status: TaskStatus; columnTasks: Task[]; onUpdateTask: (task: Task) => void; onDrop: (taskId: string, newStatus: TaskStatus) => void }) {
  const statusDot = status === 'completed' ? 'bg-success' : status === 'in_progress' ? 'bg-warning' : status === 'delayed' || status === 'blocked' ? 'bg-destructive' : status === 'review' ? 'bg-primary' : status === 'ready' ? 'bg-info' : 'bg-muted-foreground/30';

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-primary/50'); };
  const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('ring-2', 'ring-primary/50'); };
  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-primary/50');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div className="min-w-[280px] flex-shrink-0 rounded-lg p-2 bg-muted/30 transition-colors" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDropEvent}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`h-2.5 w-2.5 rounded-full ${statusDot}`} />
        <h3 className="font-medium text-sm">{statusLabels[status]}</h3>
        <Badge variant="secondary" className="text-xs ml-auto">{columnTasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {columnTasks.map((task) => (
          <div key={task.id} draggable onDragStart={e => { e.dataTransfer.setData('taskId', task.id); e.dataTransfer.effectAllowed = 'move'; }}>
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                        <Badge className={`${priorityColors[task.priority]} text-[9px]`}>{task.priority}</Badge>
                      </div>
                      {task.criticalPath && <Badge variant="destructive" className="text-[9px]">CP</Badge>}
                    </div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.department}</span>
                      <span>·</span>
                      <span>{task.phase}</span>
                    </div>
                    <Progress value={task.progress} className="h-1" />
                  </CardContent>
                </Card>
              </DialogTrigger>
              <TaskDetailDialog task={task} onUpdateTask={onUpdateTask} />
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}

const Tasks = () => {
  const { toast } = useToast();
  const [allTasks, setAllTasks] = useState<Task[]>(demoTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleCreateTask = (task: Task) => {
    setAllTasks(prev => [task, ...prev]);
    toast({ title: "Task created", description: `"${task.title}" has been created.` });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setAllTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast({ title: "Task moved", description: `Task moved to ${statusLabels[newStatus]}.` });
  };

  const filtered = allTasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (deptFilter !== 'all' && t.department !== deptFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const departments = [...new Set(allTasks.map(t => t.department))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Execution Tasks</h1>
          <p className="text-muted-foreground mt-1">{allTasks.length} tasks across all projects</p>
        </div>
        <NewTaskDialog onCreateTask={handleCreateTask} />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOrder.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Depts</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="space-y-2">
            {filtered.map((task) => <TaskRow key={task.id} task={task} onUpdateTask={handleUpdateTask} />)}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks match filters</p>}
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statusOrder.map((status) => {
              const columnTasks = filtered.filter(t => t.status === status);
              return <KanbanColumn key={status} status={status} columnTasks={columnTasks} onUpdateTask={handleUpdateTask} onDrop={handleDrop} />;
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
