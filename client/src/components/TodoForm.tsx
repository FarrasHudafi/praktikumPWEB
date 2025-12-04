/* eslint-disable @typescript-eslint/no-explicit-any */
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
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          autoFocus
          className="flex-1 bg-gray-700 border-none rounded-2xl px-4 py-4 text-gray-100 placeholder-gray-400 focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:shadow-sm transition-all"
          placeholder="add a new task..."
        />
        <button
          type="submit"
          className="bg-blue-400 text-gray-900 rounded-2xl px-6 hover:bg-blue-300 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isCreating}
        >
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <IoMdAdd size={24} />
          )}
        </button>
      </div>
    </form>
  );
};
export default TodoForm;
