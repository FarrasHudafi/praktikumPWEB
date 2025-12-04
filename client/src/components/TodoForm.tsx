/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

const TodoForm = () => {
  const [newTodo, setNewTodo] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ["createTodo"],
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await fetch(BASE_URL + `/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: newTodo }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setNewTodo("");
        return data;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  return (
    <form onSubmit={createTodo}>
      <Flex gap={3} mb={6}>
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          ref={(input) => input && input.focus()}
          bg={"gray.700"}
          border={"none"}
          borderRadius={"2xl"}
          p={4}
          color={"gray.100"}
          placeholder={"add a new task..."}
          _placeholder={{ color: "gray.400" }}
          _focus={{
            bg: "gray.650",
            boxShadow: "sm",
          }}
        />
        <Button
          type="submit"
          bg={"blue.400"}
          color={"gray.900"}
          borderRadius={"2xl"}
          px={6}
          _hover={{
            bg: "blue.300",
            transform: "scale(1.02)",
          }}
          _active={{
            transform: "scale(.98)",
          }}
          transition={"all 0.2s"}
        >
          {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={24} />}
        </Button>
      </Flex>
    </form>
  );
};
export default TodoForm;
