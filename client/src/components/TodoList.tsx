import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";

import TodoItem from "./TodoItem";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";

export type Todo = {
  id: number;
  body: string;
  completed: boolean;
};

const TodoList = () => {
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      try {
        const res = await fetch(BASE_URL + "/todos");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data || [];
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <>
      <Text
        fontSize={"3xl"}
        fontWeight={"300"}
        textAlign={"center"}
        my={6}
        color={"gray.300"}
        letterSpacing={"wide"}
      >
        today's tasks
      </Text>
      {isLoading && (
        <Flex justifyContent={"center"} my={8}>
          <Spinner size={"xl"} color={"gray.400"} thickness={"2px"} />
        </Flex>
      )}
      {!isLoading && todos?.length === 0 && (
        <Stack alignItems={"center"} gap="3" py={8}>
          <Text
            fontSize={"lg"}
            textAlign={"center"}
            color={"gray.400"}
            fontWeight={"300"}
          >
            all tasks completed ✨
          </Text>
        </Stack>
      )}
      <Stack gap={3}>
        {todos?.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </Stack>
    </>
  );
};
export default TodoList;
