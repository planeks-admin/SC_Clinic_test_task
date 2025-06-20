import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { TasksService } from "@/client"
import { TaskActionsMenu } from "@/components/Common/TaskActionMenu.tsx"
import PendingItems from "@/components/Pending/PendingItems"
import AddTask from "@/components/SharedTaskList/AddTask.tsx"
import SearchBar from "@/components/SharedTaskList/SearchBar.tsx"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { useState } from "react"

const tasksSearchSchema = z.object({
  page: z.number().catch(1),
  title: z.string().optional(),
})

const PER_PAGE = 5

function getTasksQueryOptions({
  page,
  title,
}: { page: number; title: string }) {
  return {
    queryFn: () =>
      TasksService.readTasks({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        title: title,
      }),
    queryKey: ["tasks", { page, title }],
  }
}

export const Route = createFileRoute("/_layout/index")({
  component: Tasks,
  validateSearch: (search) => tasksSearchSchema.parse(search),
})

function TasksTable({ title }: { title: string }) {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getTasksQueryOptions({ page, title }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const tasks = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingItems />
  }

  if (tasks.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any tasks yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new task to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Assignee</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tasks?.map((task) => (
            <Table.Row key={task.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {task.title}
              </Table.Cell>
              <Table.Cell
                color={!task.description ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {task.description || "N/A"}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {task.assignee}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {task.status}
              </Table.Cell>
              <Table.Cell>
                <TaskActionsMenu task={task} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Tasks() {
  const [title, setTitle] = useState("")
  const handleSearch = (value: string) => {
    setTitle(value)
  }

  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Tasks Management
      </Heading>
      <AddTask />
      <SearchBar title={title} onChange={handleSearch} />
      <TasksTable title={title} />
    </Container>
  )
}
