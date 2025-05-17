import React, { useState, useEffect, useCallback, useMemo } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState({ index: null, value: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load todos from localStorage
  useEffect(() => {
    try {
      const storedTodos = JSON.parse(localStorage.getItem("todos"));
      if (storedTodos) setTodos(storedTodos);
    } catch (error) {
      console.error("Failed to load todos from localStorage:", error);
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save todos to localStorage:", error);
    }
  }, [todos]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleDueDateChange = useCallback((e) => {
    setDueDate(e.target.value);
  }, []);

  const addTodo = useCallback(() => {
    if (inputValue.trim()) {
      setTodos([...todos, { text: inputValue, completed: false, dueDate }]);
      setInputValue("");
      setDueDate("");
    }
  }, [inputValue, dueDate, todos]);

  const updateTodo = useCallback(() => {
    console.log("Updating todo:", isEditing);
    if (isEditing.index !== null && isEditing.value.trim()) {
      const updatedTodos = [...todos];
      updatedTodos[isEditing.index].text = isEditing.value.trim();
      setTodos(updatedTodos);
      setIsEditing({ index: null, value: "" }); // Reset editing state
      console.log("Updated todos:", updatedTodos);
    }
  }, [isEditing, todos]);

  const toggleEdit = useCallback(
    (index) => {
      setIsEditing({ index, value: todos[index].text });
    },
    [todos]
  );

  const toggleTodo = useCallback(
    (index) => {
      const newTodos = [...todos];
      newTodos[index].completed = !newTodos[index].completed;
      setTodos(newTodos);
    },
    [todos]
  );

  const removeTodo = useCallback(
    (index) => {
      if (window.confirm("Are you sure you want to delete this todo?")) {
        const newTodos = todos.filter((_, i) => i !== index);
        setTodos(newTodos);
      }
    },
    [todos]
  );

  const clearCompleted = useCallback(() => {
    const newTodos = todos.filter((todo) => !todo.completed);
    setTodos(newTodos);
  }, [todos]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("My Todos", 10, 10);

    filteredTodos.forEach((todo, index) => {
      const y = 20 + index * 10;
      if (y > 280) {
        doc.addPage();
        doc.text("My Todos (continued)", 10, 10);
      }
      doc.text(
        `${index + 1}. ${todo.text} ${
          todo.dueDate ? `- Due: ${todo.dueDate}` : ""
        }`,
        10,
        y % 280
      );
    });

    doc.save("todos.pdf");
  }, [filteredTodos]);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      return (
        (filter === "completed" && todo.completed) ||
        (filter === "active" && !todo.completed) ||
        filter === "all"
      );
    });
  }, [todos, filter]);

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  return (
    <div className={`App ${isDarkMode ? "dark" : ""}`}>
      <header>
        <h1>TaskMaster-Todo App 📝</h1>
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>
      <main>
        <section className="todo-input-container">
          <input
            type="text"
            value={isEditing.index !== null ? isEditing.value : inputValue}
            onChange={
              isEditing.index !== null
                ? (e) => setIsEditing({ ...isEditing, value: e.target.value })
                : handleInputChange
            }
            onKeyPress={(e) =>
              e.key === "Enter" &&
              (isEditing.index !== null ? updateTodo() : addTodo())
            }
            placeholder="Add a new todo"
            aria-label="Todo Input"
          />
          <input
            type="date"
            value={dueDate}
            onChange={handleDueDateChange}
            aria-label="Due Date"
          />
          <button
            onClick={isEditing.index !== null ? updateTodo : addTodo}
            disabled={!inputValue.trim()}
            aria-label={isEditing.index !== null ? "Update Todo" : "Add Todo"}
          >
            {isEditing.index !== null ? "Update Todo" : "Add Todo"}
          </button>
        </section>
        <section className="todo-stats">
          <span>
            {activeCount} {activeCount === 1 ? "task" : "tasks"} left
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter Todos"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            className="clear-btn"
            onClick={clearCompleted}
            aria-label="Clear Completed Todos"
          >
            Clear Completed
          </button>
          <button
            className="download-btn"
            onClick={downloadPDF}
            aria-label="Download Todos as PDF"
          >
            Download PDF
          </button>
        </section>
        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
            <li
              key={index}
              className={`${todo.completed ? "completed" : ""} ${
                isEditing.index === index ? "editing" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(index)}
                aria-label={`Mark ${todo.text} as ${
                  todo.completed ? "incomplete" : "complete"
                }`}
              />
              <span
                onClick={() => toggleTodo(index)}
                className="todo-text"
                aria-label={`Todo: ${todo.text}`}
              >
                {todo.text} {todo.dueDate && <span>({todo.dueDate})</span>}
              </span>
              <button onClick={() => toggleEdit(index)} aria-label="Edit Todo">
                Edit
              </button>
              <button
                onClick={() => removeTodo(index)}
                aria-label="Delete Todo"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
      <footer>
        <p>Made by RJ ✌️</p>
      </footer>
    </div>
  );
}

export default App;
