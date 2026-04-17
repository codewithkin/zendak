"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zendak/ui/components/card";
import { Badge } from "@zendak/ui/components/badge";
import { Button } from "@zendak/ui/components/button";
import { Skeleton } from "@zendak/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zendak/ui/components/table";
import {
  AddCircleIcon,
  Briefcase01Icon,
  CoinsDollarIcon,
  DeliveryTruck02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import { useUsers, type WorkspaceUser } from "@/hooks/use-users";
import { InviteUserDialog } from "@/components/dialogs/invite-user-dialog";

const ROLES: WorkspaceUser["role"][] = ["ADMIN", "OPERATIONS", "ACCOUNTANT", "DRIVER"];

const roleVariant: Record<WorkspaceUser["role"], "default" | "secondary" | "outline" | "success"> = {
  ADMIN: "default",
  OPERATIONS: "secondary",
  ACCOUNTANT: "success",
  DRIVER: "outline",
};

const roleLabel: Record<WorkspaceUser["role"], string> = {
  ADMIN: "Admin",
  OPERATIONS: "Operations",
  ACCOUNTANT: "Accountant",
  DRIVER: "Driver",
};

const roleIcon: Record<WorkspaceUser["role"], typeof UserGroupIcon> = {
  ADMIN: UserGroupIcon,
  OPERATIONS: DeliveryTruck02Icon,
  ACCOUNTANT: CoinsDollarIcon,
  DRIVER: Briefcase01Icon,
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default function UsersPage() {
  const { users, isLoading, refetch } = useUsers();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<WorkspaceUser["role"] | "ALL">("ALL");

  const filtered = filterRole === "ALL" ? users : users.filter((u) => u.role === filterRole);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const opsCount = users.filter((u) => u.role === "OPERATIONS").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Team Members</h1>
          <p className="text-xs text-muted-foreground">
            Manage the people with access to your Zendak workspace.
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Icon icon={AddCircleIcon} className="size-3.5" />
          Invite User
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="flex items-end gap-1.5">
                <span className="text-2xl font-bold">{totalUsers}</span>
                <span className="mb-0.5 text-xs text-muted-foreground">{activeUsers} active</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-bold">{adminCount}</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Operations Staff</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-bold">{opsCount}</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All Users</CardTitle>
            {/* Role filter */}
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={filterRole === "ALL" ? "default" : "ghost"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setFilterRole("ALL")}
              >
                All
              </Button>
              {ROLES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={filterRole === r ? "default" : "ghost"}
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setFilterRole(r)}
                >
                  <Icon icon={roleIcon[r]} size={12} className="mr-1" />
                  {roleLabel[r]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No users found. Invite your first team member to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role]} className="text-xs">
                        {roleLabel[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "success" : "outline"} className="text-xs">
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
