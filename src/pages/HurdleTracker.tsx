import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { hurdles as demoHurdles, hurdleSeverityColors, tasks, type Hurdle } from "@/data/demo-data";
import { AlertTriangle, Clock, CheckCircle2, ArrowUpCircle, Calendar, Trash2, Eye } from "lucide-react";
import { ReportHurdleDialog } from "@/components/dialogs/ReportHurdleDialog";
import { useToast } from "@/hooks/use-toast";

const hurdleTypeLabels: Record<string, string> = {
  material_delay: 'Material Delay', labour_shortage: 'Labour Shortage', vendor_delay: 'Vendor Delay',
  approval_pending: 'Approval Pending', design_change: 'Design Change', equipment_failure: 'Equipment Failure', weather_delay: 'Weather Delay',
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <AlertTriangle className="h-4 w-4 text-warning" />,
  in_progress: <Clock className="h-4 w-4 text-info" />,
  resolved: <CheckCircle2 className="h-4 w-4 text-success" />,
  escalated: <ArrowUpCircle className="h-4 w-4 text-destructive" />,
};

function HurdleDetailDialog({ hurdle }: { hurdle: Hurdle }) {
  const affectedTask = tasks.find(t => t.id === hurdle.affectedTaskId);
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Badge className={hurdleSeverityColors[hurdle.severity]}>{hurdle.severity}</Badge>
          <Badge variant="outline" className="capitalize">{hurdle.status.replace('_', ' ')}</Badge>
        </div>
        <DialogTitle className="font-display text-xl mt-2">{hurdle.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <p className="text-sm text-muted-foreground">{hurdle.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{hurdleTypeLabels[hurdle.type]}</span></div>
          <div><span className="text-muted-foreground">Tower:</span> <span className="font-medium">{hurdle.affectedTower}</span></div>
          <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{hurdle.responsibleDepartment}</span></div>
          <div><span className="text-muted-foreground">Impact:</span> <span className="font-medium text-destructive">{hurdle.impactDays} days</span></div>
          <div><span className="text-muted-foreground">Reported:</span> <span className="font-medium">{hurdle.reportedDate}</span></div>
          {hurdle.resolvedDate && <div><span className="text-muted-foreground">Resolved:</span> <span className="font-medium">{hurdle.resolvedDate}</span></div>}
        </div>
        {affectedTask && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">Affected Task:</span> <span className="font-medium">{affectedTask.title}</span>
            <span className="text-xs text-muted-foreground ml-2">({affectedTask.department}, {affectedTask.progress}% complete)</span>
          </div>
        )}
        {hurdle.resolutionNotes && (
          <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-sm">
            <span className="font-medium text-success">Resolution:</span> {hurdle.resolutionNotes}
          </div>
        )}
      </div>
    </DialogContent>
  );
}

const HurdleTracker = () => {
  const { toast } = useToast();
  const [allHurdles, setAllHurdles] = useState<Hurdle[]>(demoHurdles);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleCreateHurdle = (hurdle: Hurdle) => {
    setAllHurdles(prev => [hurdle, ...prev]);
    toast({ title: "Hurdle reported", description: `"${hurdle.title}" has been logged.` });
  };

  const handleDelete = (id: string) => {
    setAllHurdles(prev => prev.filter(h => h.id !== id));
    toast({ title: "Hurdle deleted" });
  };

  const filtered = allHurdles.filter(h => {
    if (severityFilter !== 'all' && h.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    open: allHurdles.filter(h => h.status === 'open').length,
    inProgress: allHurdles.filter(h => h.status === 'in_progress').length,
    escalated: allHurdles.filter(h => h.status === 'escalated').length,
    resolved: allHurdles.filter(h => h.status === 'resolved').length,
    totalImpact: allHurdles.filter(h => h.status !== 'resolved').reduce((a, h) => a + h.impactDays, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Hurdle Tracker</h1>
          <p className="text-muted-foreground mt-1">{allHurdles.length} hurdles tracked</p>
        </div>
        <ReportHurdleDialog onCreateHurdle={handleCreateHurdle} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Open', value: stats.open, icon: <AlertTriangle className="h-4 w-4 text-warning" /> },
          { label: 'In Progress', value: stats.inProgress, icon: <Clock className="h-4 w-4 text-info" /> },
          { label: 'Escalated', value: stats.escalated, icon: <ArrowUpCircle className="h-4 w-4 text-destructive" /> },
          { label: 'Resolved', value: stats.resolved, icon: <CheckCircle2 className="h-4 w-4 text-success" /> },
          { label: 'Impact Days', value: stats.totalImpact, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-lg font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((hurdle) => {
          const affectedTask = tasks.find(t => t.id === hurdle.affectedTaskId);
          return (
            <Card key={hurdle.id}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  {statusIcons[hurdle.status]}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{hurdle.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{hurdle.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={hurdleSeverityColors[hurdle.severity]}>{hurdle.severity}</Badge>
                        <Badge variant="outline" className="capitalize">{hurdle.status.replace('_', ' ')}</Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          </DialogTrigger>
                          <HurdleDetailDialog hurdle={hurdle} />
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hurdle.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Type: <span className="text-foreground">{hurdleTypeLabels[hurdle.type]}</span></span>
                      <span>Tower: <span className="text-foreground">{hurdle.affectedTower}</span></span>
                      <span>Dept: <span className="text-foreground">{hurdle.responsibleDepartment}</span></span>
                      <span>Impact: <span className="text-foreground font-medium">{hurdle.impactDays} days</span></span>
                    </div>
                    {affectedTask && (
                      <div className="text-xs text-muted-foreground">Affects: <span className="text-foreground">{affectedTask.title}</span></div>
                    )}
                    {hurdle.resolutionNotes && (
                      <div className="p-2 rounded bg-success/5 border border-success/20 text-xs">
                        <span className="font-medium text-success">Resolution:</span> {hurdle.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HurdleTracker;
