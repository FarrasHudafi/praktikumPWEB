import Navbar from "./components/Navbar";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-[900px] mx-auto w-full px-4 flex-1">
        <TodoForm />
        <TodoList />
      </div>
    </div>
  );
}

export default App;
