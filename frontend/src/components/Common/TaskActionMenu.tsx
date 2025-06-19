import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { Task } from "@/client"
import ClaimTask from "../SharedTaskList/ClaimTasks"

interface TaskActionsMenuProps {
  task: Task
}

export const TaskActionsMenu = ({ task }: TaskActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        {task.id && <ClaimTask id={task.id} />}
      </MenuContent>
    </MenuRoot>
  )
}
