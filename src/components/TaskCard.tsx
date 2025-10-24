import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { Trash2, Edit2, Clock, Flag, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { TaskForm } from './TaskForm';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatusChange(newStatus: Task['status']) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  }

  const priorityColors = {
    low: 'from-slate-400 to-slate-500',
    medium: 'from-amber-400 to-amber-500',
    high: 'from-rose-400 to-rose-500',
  };

  const statusIcons = {
    pending: <Circle className="w-5 h-5" />,
    in_progress: <PlayCircle className="w-5 h-5" />,
    completed: <CheckCircle2 className="w-5 h-5" />,
  };

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden task-card-hover animate-in border border-slate-200">
        <div className={`h-2 bg-gradient-to-r ${priorityColors[task.priority]}`}></div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => handleStatusChange('pending')}
              disabled={task.status === 'pending'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                task.status === 'pending'
                  ? statusColors.pending
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              <Circle className="w-4 h-4" />
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={task.status === 'in_progress'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                task.status === 'in_progress'
                  ? statusColors.in_progress
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-cyan-50 hover:border-cyan-200'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={task.status === 'completed'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                task.status === 'completed'
                  ? statusColors.completed
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <Flag className="w-4 h-4" />
                <span className="capitalize">{task.priority}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <TaskForm
          userId={task.user_id}
          task={task}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}
