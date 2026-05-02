import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  IndianRupee, 
  User, 
  Search,
  ExternalLink,
  Ban,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalDataTable } from "@/components/portal/PortalDataTable";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const RefundManagementPage = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["refund-requests"],
    queryFn: async () => {
      const { data } = await api.get("/refunds");
      return data;
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data } = await api.post(`/refunds/${id}/process`, { adminNotes: notes });
      return data;
    },
    onSuccess: () => {
      toast.success("Manual refund processed successfully");
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Refund failed again.");
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data } = await api.patch(`/refunds/${id}/status`, { 
        status: 'ignored',
        adminNotes: notes 
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Request marked as ignored");
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Action failed.");
    },
  });

  const columns = [
    {
      header: "Event & User",
      accessor: (r: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-xl font-black text-[10px] border border-rose-500/20 italic">
            {r.event?.title?.charAt(0) || "E"}
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tight text-foreground italic leading-tight">
              {r.event?.title || "Deleted Event"}
            </p>
            <p className="text-[8px] font-black uppercase text-muted-foreground italic mt-0.5 opacity-60">
              {r.user?.name} ({r.user?.email})
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Transaction Details",
      accessor: (r: any) => (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black italic text-foreground uppercase tracking-tight">
            <IndianRupee className="h-3 w-3" />
            {r.amount.toLocaleString()}
          </div>
          <div className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50">
            PID: {r.paymentId}
          </div>
        </div>
      ),
    },
    {
      header: "Failure Reason",
      accessor: (r: any) => (
        <div className="max-w-[200px]">
          <p className="text-[9px] font-bold italic text-rose-500 leading-tight">
            {r.failureReason || "Unknown failure"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      headerClassName: "text-center",
      accessor: (r: any) => (
        <div className="flex justify-center">
          <Badge 
            variant="outline"
            className={`rounded-lg text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 italic ${
              r.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
              r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
              'bg-muted text-muted-foreground/60 border-border/50'
            }`}
          >
            {r.status}
          </Badge>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      accessor: (r: any) => (
        <div className="flex justify-end gap-2">
          {r.status === 'pending' && (
            <Button 
              size="sm" 
              onClick={() => setSelectedRequest(r)}
              className="h-8 rounded-lg bg-[#C4F000] text-black hover:bg-[#A3C800] text-[8px] font-black uppercase tracking-widest italic"
            >
              Resolve
            </Button>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-lg border border-border"
            title="View Notes"
            onClick={() => {
                if (r.adminNotes) toast.info(r.adminNotes);
                else toast.info("No admin notes yet.");
            }}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6 bg-background min-h-screen">
      <PortalPageHeader
        title="Refund Backlog"
        icon={AlertCircle}
        subtitle="Operational oversight for failed automatic refunds requiring manual intervention."
        badge={
          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-[8px] font-black uppercase tracking-widest italic">
            {requests?.filter((r: any) => r.status === 'pending').length || 0} PENDING
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-3">
            <PortalDataTable
                columns={columns}
                data={requests || []}
                isLoading={isLoading}
                searchPlaceholder="FILTER REQUESTS..."
                rowKey="_id"
            />
         </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3 text-primary">
              <IndianRupee className="h-6 w-6 text-emerald-500" />
              Resolve Refund
            </DialogTitle>
            <DialogDescription className="text-sm font-bold italic opacity-70">
              Attempt to re-process the refund for <span className="text-foreground font-black">₹{selectedRequest?.amount?.toLocaleString()}</span> via Razorpay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Failure Reason</p>
                <p className="text-xs font-bold text-rose-500 italic">{selectedRequest?.failureReason}</p>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolution Notes</p>
                <Textarea 
                    placeholder="Describe the action taken..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-[100px] bg-background border-border italic text-xs font-bold rounded-xl"
                />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
                variant="outline"
                onClick={() => ignoreMutation.mutate({ id: selectedRequest._id, notes: adminNotes })}
                disabled={ignoreMutation.isPending || processMutation.isPending}
                className="flex-1 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] italic border-border"
            >
                <Ban className="mr-2 h-3.5 w-3.5" />
                Ignore Request
            </Button>
            <Button 
                onClick={() => processMutation.mutate({ id: selectedRequest._id, notes: adminNotes })}
                disabled={processMutation.isPending || ignoreMutation.isPending}
                className="flex-1 h-10 rounded-xl bg-primary text-background hover:bg-primary/90 font-black uppercase tracking-widest text-[9px] italic"
            >
                {processMutation.isPending ? "Processing..." : "Retry Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundManagementPage;
