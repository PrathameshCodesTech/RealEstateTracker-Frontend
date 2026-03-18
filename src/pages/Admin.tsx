import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { users } from "@/data/demo-data";
import { Settings, Shield, Users, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const escalationRules = [
  { level: 1, role: 'Site Engineer', days: 1, description: 'First notification to assigned engineer' },
  { level: 2, role: 'Project Manager', days: 2, description: 'Escalate if unresolved after 2 days' },
  { level: 3, role: 'HOD', days: 3, description: 'Department head notification' },
  { level: 4, role: 'Project Director', days: 5, description: 'Director-level escalation' },
  { level: 5, role: 'CEO', days: 7, description: 'CEO escalation for critical issues' },
];

const Admin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Admin</h1>
        <p className="text-muted-foreground mt-1">System configuration and user management</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">User Management</CardTitle>
              <Button size="sm">+ Add User</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="secondary">{user.department}</Badge>
                    <Badge>{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Escalation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalationRules.map((rule) => (
                  <div key={rule.level} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
                      L{rule.level}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{rule.role}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Badge variant="outline">{rule.days} days</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Settings className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-display font-semibold">General Settings</h3>
                  <p className="text-sm text-muted-foreground">Company info, timezone, language</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-display font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Email, push, escalation rules</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-display font-semibold">Roles & Permissions</h3>
                  <p className="text-sm text-muted-foreground">Define role-based access</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-display font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">2FA, session management</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
