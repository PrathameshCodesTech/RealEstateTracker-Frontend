import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasks, towers, type Hurdle, type HurdleType, type HurdleSeverity, type Department } from "@/data/demo-data";
import { Plus } from "lucide-react";

const hurdleTypes: { value: HurdleType; label: string }[] = [
  { value: 'material_delay', label: 'Material Delay' },
  { value: 'labour_shortage', label: 'Labour Shortage' },
  { value: 'vendor_delay', label: 'Vendor Delay' },
  { value: 'approval_pending', label: 'Approval Pending' },
  { value: 'design_change', label: 'Design Change' },
  { value: 'equipment_failure', label: 'Equipment Failure' },
  { value: 'weather_delay', label: 'Weather Delay' },
];

const departments: Department[] = ['Civil', 'Electrical', 'Plumbing', 'Finishing', 'MEP', 'Fire Safety', 'Structural', 'Legal', 'Admin'];
const severities: HurdleSeverity[] = ['critical', 'high', 'medium', 'low'];

interface ReportHurdleDialogProps {
  onCreateHurdle: (hurdle: Hurdle) => void;
  trigger?: React.ReactNode;
}

export function ReportHurdleDialog({ onCreateHurdle, trigger }: ReportHurdleDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: '' as HurdleType, affectedTaskId: '', affectedTower: '',
    responsibleDepartment: '' as Department, impactDays: 0, severity: 'medium' as HurdleSeverity,
    projectId: '',
  });

  const handleSubmit = () => {
    if (!form.title || !form.type) return;
    const task = tasks.find(t => t.id === form.affectedTaskId);
    const newHurdle: Hurdle = {
      id: `h_${Date.now()}`,
      title: form.title,
      description: form.description,
      type: form.type,
      affectedTaskId: form.affectedTaskId,
      affectedTower: form.affectedTower,
      responsibleDepartment: form.responsibleDepartment || 'Civil',
      impactDays: form.impactDays,
      severity: form.severity,
      status: 'open',
      projectId: task?.projectId || form.projectId || 'p1',
      reportedDate: new Date().toISOString().split('T')[0],
    };
    onCreateHurdle(newHurdle);
    setOpen(false);
    setForm({ title: '', description: '', type: '' as HurdleType, affectedTaskId: '', affectedTower: '', responsibleDepartment: '' as Department, impactDays: 0, severity: 'medium', projectId: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="h-4 w-4 mr-2" />Report Hurdle</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Report New Hurdle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Cement shortage" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the hurdle..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hurdle Type *</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as HurdleType })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {hurdleTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v as HurdleSeverity })}>
                <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  {severities.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Affected Task</Label>
              <Select value={form.affectedTaskId} onValueChange={v => setForm({ ...form, affectedTaskId: v })}>
                <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                <SelectContent>
                  {tasks.slice(0, 20).map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Affected Tower</Label>
              <Select value={form.affectedTower} onValueChange={v => setForm({ ...form, affectedTower: v })}>
                <SelectTrigger><SelectValue placeholder="Select tower" /></SelectTrigger>
                <SelectContent>
                  {towers.map(t => <SelectItem key={t.id} value={t.name}>{t.name} ({t.projectId})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Responsible Department</Label>
              <Select value={form.responsibleDepartment} onValueChange={v => setForm({ ...form, responsibleDepartment: v as Department })}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Impact Days</Label>
              <Input type="number" min={0} value={form.impactDays} onChange={e => setForm({ ...form, impactDays: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.type}>Report Hurdle</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
