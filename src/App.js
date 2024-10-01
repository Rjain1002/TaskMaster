import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState({ index: null, value: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    if (storedTodos) setTodos(storedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isEditing.index !== null) {
        updateTodo();
      } else {
        addTodo();
      }
    }
  };

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { text: inputValue, completed: false, dueDate }]);
      setInputValue("");
      setDueDate("");
    }
  };

  const updateTodo = () => {
    const updatedTodos = [...todos];
    updatedTodos[isEditing.index].text = isEditing.value;
    setTodos(updatedTodos);
    setIsEditing({ index: null, value: "" });
  };

  const toggleEdit = (index) => {
    setIsEditing({ index, value: todos[index].text });
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  const clearCompleted = () => {
    const newTodos = todos.filter((todo) => !todo.completed);
    setTodos(newTodos);
  };

  const activeCount = todos.filter((todo) => !todo.completed).length;

  const filteredTodos = todos.filter((todo) => {
    return (
      (filter === "completed" && todo.completed) ||
      (filter === "active" && !todo.completed) ||
      filter === "all"
    );
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("My Todos", 10, 10);

    filteredTodos.forEach((todo, index) => {
      doc.text(
        `${index + 1}. ${todo.text} ${
          todo.dueDate ? `- Due: ${todo.dueDate}` : ""
        }`,
        10,
        20 + index * 10
      );
    });

    doc.save("todos.pdf");
  };

  return (
    <div className={`App ${isDarkMode ? "dark" : ""}`}>
      <h1>TaskMaster-Todo App 📝</h1>
      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="todo-input-container">
        <input
          type="text"
          value={isEditing.index !== null ? isEditing.value : inputValue}
          onChange={
            isEditing.index !== null
              ? (e) => setIsEditing({ ...isEditing, value: e.target.value })
              : handleInputChange
          }
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo"
        />
        <input type="date" value={dueDate} onChange={handleDueDateChange} />
        <button onClick={isEditing.index !== null ? updateTodo : addTodo}>
          {isEditing.index !== null ? "Update Todo" : "Add Todo"}
        </button>
      </div>
      <div className="todo-stats">
        <span>
          {activeCount} {activeCount === 1 ? "task" : "tasks"} left
        </span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button className="clear-btn" onClick={clearCompleted}>
          Clear Completed
        </button>
        <button className="download-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
      <ul className="todo-list">
        {filteredTodos.map((todo, index) => (
          <li key={index} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(index)}
            />
            <span onClick={() => toggleTodo(index)} className="todo-text">
              {todo.text} {todo.dueDate && <span>({todo.dueDate})</span>}
            </span>
            <button onClick={() => toggleEdit(index)}>Edit</button>
            <button onClick={() => removeTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <footer>
        <p>Made by RJ ✌️</p>
      </footer>
    </div>
  );
}

export default App;
