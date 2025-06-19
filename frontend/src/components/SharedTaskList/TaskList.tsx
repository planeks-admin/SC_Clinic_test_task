import type { Task } from "@/types"
import type React from "react"
import TaskItem from "./TaskItem"

interface Props {
  tasks: Task[]
  onClaim: (id: string) => void
}

const TaskList: React.FC<Props> = ({ tasks, onClaim }) => {
  if (!tasks.length) return <div>No tasks available.</div>
  return (
    <ul className="list-group">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onClaim={onClaim} />
      ))}
    </ul>
  )
}

export default TaskList
