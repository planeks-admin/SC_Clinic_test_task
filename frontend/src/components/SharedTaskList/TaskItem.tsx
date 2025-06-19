import type { Task } from "@/types"
import type React from "react"

interface Props {
  task: Task
  onClaim: (id: string) => void
}

const TaskItem: React.FC<Props> = ({ task, onClaim }) => (
  <li className="list-group-item d-flex justify-content-between align-items-start">
    <div>
      <div>
        <strong>{task.title}</strong> – Assigned to {task.assignee}
      </div>
      <div className="text-muted">{task.description}</div>
    </div>
    <button className="btn btn-sm btn-success" onClick={() => onClaim(task.id)}>
      Claim Task
    </button>
  </li>
)

export default TaskItem
