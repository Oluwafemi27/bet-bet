import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Lock, Unlock, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  balance: number;
  created_at: string;
  status?: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err: any) {
      toast({ title: "Error loading user", description: err.message, variant: "destructive" });
      navigate("/admin/users/list");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!user) return;
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: `User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully` });
      setUser({ ...user, status: newStatus });
    } catch (err: any) {
      toast({ title: "Error updating status", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" onClick={() => navigate("/admin/users/list")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <AdminPageShell
      title={user.full_name || "User Details"}
      description={`Account information and management for ${user.email}`}
      actions={
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/admin/users/list")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">Full Name</label>
                <p className="text-lg font-medium text-foreground">{user.full_name || "—"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-base text-foreground">{user.email || "—"}</p>
              </div>

              {user.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <p className="text-base text-foreground">{user.phone}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <p className="text-base text-foreground">
                  {new Date(user.created_at).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-foreground">
                ₦{Number(user.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Current wallet balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button
                className={`w-full gap-2 ${
                  user.status === 'banned'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleStatusChange}
              >
                {user.status === 'banned' ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    Unban User
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Ban User
                  </>
                )}
              </Button>

              <div className="pt-3 border-t border-border/30">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Status</p>
                <div className={`inline-block px-3 py-1 rounded-full font-semibold text-sm border ${
                  user.status === 'banned'
                    ? 'bg-red-100/20 text-red-700 border-red-200/50'
                    : 'bg-green-100/20 text-green-700 border-green-200/50'
                }`}>
                  {user.status === 'banned' ? 'Banned' : 'Active'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/50 border-b border-border/50">
              <CardTitle className="text-lg font-bold text-sm">User ID</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs font-mono text-muted-foreground break-all">{user.id}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default UserDetail;
