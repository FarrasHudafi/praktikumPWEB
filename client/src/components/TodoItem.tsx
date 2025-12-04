import { FaCheckCircle, FaEdit } from "react-icons/fa";
import { MdDelete, MdCheck, MdClose } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import { useState } from "react";

const TodoItem = ({ todo }: { todo: Todo }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.body);

  const { mutate: updateTodo, isPending: isUpdating } = useMutation({
    mutationKey: ["updateTodo"],
    mutationFn: async () => {
      if (todo.completed) return alert("Todo is already completed");
      try {
        const res = await fetch(BASE_URL + `/todos/${todo.id}`, {
          method: "PATCH",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const { mutate: editTodo, isPending: isEditingSaving } = useMutation({
    mutationKey: ["editTodo"],
    mutationFn: async (newBody: string) => {
      try {
        const res = await fetch(BASE_URL + `/todos/${todo.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: newBody }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setIsEditing(false);
    },
  });

  const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
    mutationKey: ["deleteTodo"],
    mutationFn: async () => {
      try {
        const res = await fetch(BASE_URL + `/todos/${todo.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleSaveEdit = () => {
    if (editText.trim() === "") {
      alert("Todo cannot be empty");
      return;
    }
    if (editText.trim() === todo.body) {
      setIsEditing(false);
      return;
    }
    editTodo(editText.trim());
  };

  const handleCancelEdit = () => {
    setEditText(todo.body);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex flex-1 items-center border border-gray-600 p-2 rounded-lg justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") handleCancelEdit();
            }}
            autoFocus
            className="flex-1 bg-gray-700 border-none rounded px-2 py-1 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
          />
        ) : (
          <p
            className={`${
              todo.completed ? "text-green-200 line-through" : "text-yellow-100"
            }`}
          >
            {todo.body}
          </p>
        )}
        {todo.completed && (
          <span className="ml-1 px-2 py-1 text-xs font-semibold rounded bg-green-500 text-white">
            Done
          </span>
        )}
        {!todo.completed && (
          <span className="ml-1 px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-gray-900">
            In Progress
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        {isEditing ? (
          <>
            <button
              className="text-green-500 cursor-pointer hover:text-green-400 transition-colors disabled:opacity-50"
              onClick={handleSaveEdit}
              disabled={isEditingSaving}
            >
              {!isEditingSaving && <MdCheck size={24} />}
              {isEditingSaving && (
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
            <button
              className="text-gray-500 cursor-pointer hover:text-gray-400 transition-colors"
              onClick={handleCancelEdit}
            >
              <MdClose size={24} />
            </button>
          </>
        ) : (
          <>
            <button
              className="text-blue-500 cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit size={18} />
            </button>
            <button
              className="text-green-500 cursor-pointer hover:text-green-400 transition-colors disabled:opacity-50"
              onClick={() => updateTodo()}
              disabled={isUpdating}
            >
              {!isUpdating && <FaCheckCircle size={20} />}
              {isUpdating && (
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
            <button
              className="text-red-500 cursor-pointer hover:text-red-400 transition-colors disabled:opacity-50"
              onClick={() => deleteTodo()}
              disabled={isDeleting}
            >
              {!isDeleting && <MdDelete size={25} />}
              {isDeleting && (
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
export default TodoItem;
