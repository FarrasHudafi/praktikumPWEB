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
      const res = await fetch(BASE_URL + "/todos");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data || [];
    },
  });

  return (
    <>
      {/* Title */}
      <div className="flex justify-center">
        <p className="text-3xl font-bold text-center my-6 text-gray-300 tracking-wide pb-6">
          today's tasks
        </p>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && todos?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-lg text-center text-gray-400 font-light">
            all tasks completed ✨
          </p>
        </div>
      )}

      {/* Todo List */}
      <div className="flex flex-col gap-3">
        {todos?.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </>
  );
};

export default TodoList;
