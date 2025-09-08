"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { Plus, Check, Clock, AlertCircle, Trash2, GripVertical, Loader, Calendar } from "lucide-react";
import toast from "react-hot-toast";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  deadline?: Date | null;
  order: number;
}

interface MilestonesManagerProps {
  projectId: string;
}

export function MilestonesManager({ projectId }: MilestonesManagerProps) {
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    deadline: "",
  });
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    deadline: "",
  });

  // Fetch milestones for the project
  const { 
    data: milestones, 
    isLoading, 
    refetch 
  } = trpc.milestone.getByProject.useQuery({ projectId });

  // Mutations
  const createMutation = trpc.milestone.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewMilestone({ title: "", deadline: "" });
    },
    onError: (error) => {
      console.error("Error creating milestone:", error);
      toast.error(`Error creating milestone: ${error.message}`, {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
  });

  const updateMutation = trpc.milestone.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingMilestone(null);
      setEditData({ title: "", deadline: "" });
    },
    onError: (error) => {
      console.error("Error updating milestone:", error);
      toast.error(`Error updating milestone: ${error.message}`, {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
  });

  const updateStatusMutation = trpc.milestone.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error updating milestone status:", error);
      toast.error(`Error updating milestone status: ${error.message}`, {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
  });

  const deleteMutation = trpc.milestone.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting milestone:", error);
      toast.error(`Error deleting milestone: ${error.message}`, {
        style: {
          background: '#FF3EA5',
          color: '#FFFFFF',
          border: '2px solid #111111',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
        }
      });
    },
  });

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;

    const nextOrder = milestones ? milestones.length + 1 : 1;
    
    // Create basic payload without deadline for now
    const payload = {
      title: newMilestone.title.trim(),
      projectId,
      order: nextOrder,
      status: 'PENDING' as const,
    };
    
    console.log('Payload before sending:', payload);
    console.log('Payload deadline type:', typeof payload.deadline);
    console.log('Payload deadline value:', payload.deadline);
    console.log('JSON stringified payload:', JSON.stringify(payload));
    
    await createMutation.mutateAsync(payload);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditData({
      title: milestone.title,
      deadline: milestone.deadline 
        ? new Date(milestone.deadline).toISOString().split('T')[0] 
        : "",
    });
  };

  const handleUpdateMilestone = async (milestoneId: string) => {
    if (!editData.title.trim()) return;

    const payload: any = {
      id: milestoneId,
      title: editData.title.trim(),
    };
    
    // Handle deadline properly - only include if provided
    if (editData.deadline && editData.deadline.trim()) {
      payload.deadline = new Date(editData.deadline);
    } else {
      payload.deadline = null;
    }

    await updateMutation.mutateAsync(payload);
  };

  const handleStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
    await updateStatusMutation.mutateAsync({
      id: milestoneId,
      status,
    });
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    toast((t) => (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '4px',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#111111',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            ⚠️ Delete Milestone?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666666',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            This action cannot be undone. The milestone will be permanently removed.
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #111111',
              color: '#111111',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F0F0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteMutation.mutateAsync({ id: milestoneId });
            }}
            disabled={deleteMutation.isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF3EA5',
              border: '2px solid #111111',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: deleteMutation.isLoading ? 'not-allowed' : 'pointer',
              opacity: deleteMutation.isLoading ? 0.6 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!deleteMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#E1306C';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleteMutation.isLoading) {
                e.currentTarget.style.backgroundColor = '#FF3EA5';
              }
            }}
          >
            {deleteMutation.isLoading ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #FFFFFF',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Deleting...
              </>
            ) : (
              <>
                🗑️ Delete
              </>
            )}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#FFFFFF',
        border: '3px solid #111111',
        boxShadow: '6px 6px 0px #111111',
        borderRadius: '0px',
        maxWidth: '400px',
        padding: '16px'
      },
      id: 'delete-milestone-confirmation'
    });
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Check size={16} className="text-green-600" />;
      case "IN_PROGRESS":
        return <Clock size={16} className="text-blue-600" />;
      case "PENDING":
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case "COMPLETED":
        return "#10B981"; // green-500
      case "IN_PROGRESS":
        return "#3B82F6"; // blue-500
      case "PENDING":
        return "#6B7280"; // gray-500
    }
  };

  if (isLoading) {
    return (
      <RetroCard padding="lg">
        <div className="flex items-center justify-center gap-2">
          <Loader className="animate-spin" size={20} />
          <span>Loading milestones...</span>
        </div>
      </RetroCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '24px',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#111111',
          marginBottom: '8px'
        }}>
          Project Milestones
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#666666',
        }}>
          Manage project milestones and track progress
        </p>
      </div>

      {/* Add New Milestone */}
      <RetroCard padding="lg">
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} />
            <span style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#111111',
            }}>
              Add New Milestone
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#111111',
                marginBottom: '4px',
                display: 'block'
              }}>
                Milestone Title *
              </label>
              <RetroInput
                type="text"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Enter milestone title"
                required
              />
            </div>
            
            <div>
              <label style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#111111',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={12} />
                Deadline (Optional)
              </label>
              <RetroInput
                type="date"
                value={newMilestone.deadline}
                onChange={(e) => setNewMilestone(prev => ({
                  ...prev,
                  deadline: e.target.value
                }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <RetroButton
              type="submit"
              variant="primary"
              disabled={!newMilestone.title.trim() || createMutation.isLoading}
            >
              {createMutation.isLoading ? "Creating..." : "Add Milestone"}
            </RetroButton>
          </div>
        </form>
      </RetroCard>

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones && milestones.length > 0 ? (
          milestones.map((milestone) => (
            <RetroCard key={milestone.id} padding="lg">
              {editingMilestone === milestone.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <RetroInput
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div>
                      <RetroInput
                        type="date"
                        value={editData.deadline}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          deadline: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <RetroButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateMilestone(milestone.id)}
                      disabled={updateMutation.isLoading}
                    >
                      {updateMutation.isLoading ? "Saving..." : "Save"}
                    </RetroButton>
                    <RetroButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingMilestone(null)}
                    >
                      Cancel
                    </RetroButton>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center cursor-pointer">
                      <GripVertical size={16} className="text-gray-400 mr-2" />
                      <span style={{
                        backgroundColor: getStatusColor(milestone.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginRight: '12px'
                      }}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111111',
                        marginBottom: '4px'
                      }}>
                        {milestone.title}
                      </h4>
                      {milestone.deadline && (
                        <p style={{
                          fontSize: '12px',
                          color: '#666666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Calendar size={12} />
                          Due: {new Date(milestone.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Change Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusChange(milestone.id, "PENDING")}
                        disabled={milestone.status === "PENDING" || updateStatusMutation.isLoading}
                        className={`p-1 rounded border ${
                          milestone.status === "PENDING" 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                        title="Mark as Pending"
                      >
                        <AlertCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(milestone.id, "IN_PROGRESS")}
                        disabled={milestone.status === "IN_PROGRESS" || updateStatusMutation.isLoading}
                        className={`p-1 rounded border ${
                          milestone.status === "IN_PROGRESS" 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-100 hover:bg-blue-200'
                        } transition-colors`}
                        title="Mark as In Progress"
                      >
                        <Clock size={14} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(milestone.id, "COMPLETED")}
                        disabled={milestone.status === "COMPLETED" || updateStatusMutation.isLoading}
                        className={`p-1 rounded border ${
                          milestone.status === "COMPLETED" 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-100 hover:bg-green-200'
                        } transition-colors`}
                        title="Mark as Completed"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    <RetroButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditMilestone(milestone)}
                    >
                      Edit
                    </RetroButton>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      disabled={deleteMutation.isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete milestone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </RetroCard>
          ))
        ) : (
          <RetroCard padding="xl" className="text-center">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111111',
              marginBottom: '8px'
            }}>
              No Milestones Yet
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#666666'
            }}>
              Add your first milestone to start tracking project progress.
            </p>
          </RetroCard>
        )}
      </div>

      {/* Milestone Statistics */}
      {milestones && milestones.length > 0 && (
        <RetroCard padding="lg">
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111111',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Milestone Progress
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#6B7280'
              }}>
                {milestones.filter(m => m.status === "PENDING").length}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                textTransform: 'uppercase'
              }}>
                Pending
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#3B82F6'
              }}>
                {milestones.filter(m => m.status === "IN_PROGRESS").length}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#3B82F6',
                textTransform: 'uppercase'
              }}>
                In Progress
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#10B981'
              }}>
                {milestones.filter(m => m.status === "COMPLETED").length}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#10B981',
                textTransform: 'uppercase'
              }}>
                Completed
              </div>
            </div>
          </div>
        </RetroCard>
      )}
    </div>
  );
}
