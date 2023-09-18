import TodoModel from "../models/todoModel.js";

// Get all todos
export const getTodos = async (req, res) => {
  try {
    // Find all todos
    const todos = await TodoModel.find({});

    // Return todos
    return res.status(200).json(todos);
  } catch (error) {
    // If there is an error, return 500 and the error message
    // You can read more about HTTP status codes here:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // Or this meme:
    // https://external-preview.redd.it/VIIvCoTbkXb32niAD-rxG8Yt4UEi1Hx9RXhdHHIagYo.jpg?auto=webp&s=6dde056810f99fc3d8dab920379931cb96034f4b
    return res.status(500).json({ message: error.message });
  }
};

// Get one todo
export const getTodo = async (req, res) => {
  const { id } = req.params;
  try {
    // Find all todos
    const todo = await TodoModel.findById(id);

    // Return todos
    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a todo
export const createTodo = async (req, res) => {
  const { date, content, tag, mood } = req.body;

  // Check title and description
  if (!date || !content || !tag || !mood) {
    return res
      .status(400)
      .json({ message: "Date, content, tag, and mood are required!" });
  }

  // Create a new todo
  try {
    const newTodo = await TodoModel.create({
      date,
      content,
      tag,
      mood,
      completed: false,
    });
    return res.status(201).json(newTodo);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a todo
export const updateTodo = async (req, res) => {
  const { id } = req.params;
  const { date, content, tag, mood, completed } = req.body;

  try {
    // Check if the id is valid
    const existedTodo = await TodoModel.findById(id);
    if (!existedTodo) {
      return res.status(404).json({ message: "Todo not found!" });
    }

    // Update the todo
    if (date !== undefined) existedTodo.date = date;
    if (content !== undefined) existedTodo.content = content;
    if (tag !== undefined) existedTodo.tag = tag;
    if (mood !== undefined) existedTodo.mood = mood;
    if (completed !== undefined) existedTodo.completed = completed;

    // Save the updated todo
    await existedTodo.save();

    // Rename _id to id
    existedTodo.id = existedTodo._id;
    delete existedTodo._id;

    return res.status(200).json(existedTodo);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the id is valid
    const existedTodo = await TodoModel.findById(id);
    if (!existedTodo) {
      return res.status(200).json({ message: "Todo not exist!" });
    }
    // Delete the todo
    await TodoModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "Todo deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
