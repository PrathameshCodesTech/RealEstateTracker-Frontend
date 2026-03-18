import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, towers, floors, users, checklistTemplates, type Task, type Department, type Priority, type TaskStatus } from "@/data/demo-data";
import { Plus } from "lucide-react";

const departments: Department[] = ['Civil', 'Electrical', 'Plumbing', 'Finishing', 'MEP', 'Fire Safety', 'Structural', 'Legal', 'Admin'];
const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

interface NewTaskDialogProps {
  onCreateTask: (task: Task) => void;
  trigger?: React.ReactNode;
}

export function NewTaskDialog({ onCreateTask, trigger }: NewTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', department: '' as Department, assignedHOD: '', assignedUsers: [] as string[],
    startDate: '', endDate: '', priority: 'medium' as Priority, projectId: '', towerId: '', floorId: '',
    phase: '', checklistTemplateId: '',
  });

  const projectTowers = towers.filter(t => t.projectId === form.projectId);
  const towerFloors = floors.filter(f => f.towerId === form.towerId);
  const hods = users.filter(u => u.role === 'HOD');
  const engineers = users.filter(u => u.role === 'Site Engineer' || u.role === 'Vendor');

  const handleSubmit = () => {
    if (!form.title || !form.projectId) return;
    const template = checklistTemplates.find(ct => ct.id === form.checklistTemplateId);
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: form.title,
      description: form.description,
      department: form.department || 'Civil',
      assignedHOD: form.assignedHOD,
      assignedUsers: form.assignedUsers,
      startDate: form.startDate,
      endDate: form.endDate,
      priority: form.priority,
      status: 'not_started' as TaskStatus,
      dependencies: [],
      checklist: template ? template.items.map((item, i) => ({ id: `cl_${Date.now()}_${i}`, title: item, completed: false })) : [],
      progress: 0,
      delayDays: 0,
      criticalPath: form.priority === 'critical',
      projectId: form.projectId,
      towerId: form.towerId,
      floorId: form.floorId,
      phase: form.phase,
      comments: [],
    };
    onCreateTask(newTask);
    setOpen(false);
    setForm({ title: '', description: '', department: '' as Department, assignedHOD: '', assignedUsers: [], startDate: '', endDate: '', priority: 'medium', projectId: '', towerId: '', floorId: '', phase: '', checklistTemplateId: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="h-4 w-4 mr-2" />New Task</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task Name *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Slab Casting - Floor 5" />
            </div>
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select value={form.phase} onValueChange={v => setForm({ ...form, phase: v })}>
                <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                <SelectContent>
                  {['Pre-Construction', 'Foundation', 'Structure', 'MEP', 'Finishing', 'Handover'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Task description..." />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={form.projectId} onValueChange={v => setForm({ ...form, projectId: v, towerId: '', floorId: '' })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tower</Label>
              <Select value={form.towerId} onValueChange={v => setForm({ ...form, towerId: v, floorId: '' })}>
                <SelectTrigger><SelectValue placeholder="Select tower" /></SelectTrigger>
                <SelectContent>
                  {projectTowers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Select value={form.floorId} onValueChange={v => setForm({ ...form, floorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select floor" /></SelectTrigger>
                <SelectContent>
                  {towerFloors.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({ ...form, department: v as Department })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned HOD</Label>
              <Select value={form.assignedHOD} onValueChange={v => setForm({ ...form, assignedHOD: v })}>
                <SelectTrigger><SelectValue placeholder="Select HOD" /></SelectTrigger>
                <SelectContent>
                  {hods.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.department})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Checklist Template</Label>
            <Select value={form.checklistTemplateId} onValueChange={v => setForm({ ...form, checklistTemplateId: v })}>
              <SelectTrigger><SelectValue placeholder="Attach checklist template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No checklist</SelectItem>
                {checklistTemplates.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.name} ({ct.items.length} items)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.projectId}>Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
